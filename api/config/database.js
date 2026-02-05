import pkg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;
dotenv.config();

// Get directory path (works in both ESM and bundled environments)
let __dirname;
try {
  __dirname = path.dirname(fileURLToPath(import.meta.url));
} catch {
  // Fallback for bundled/CJS environment
  __dirname = process.cwd();
}

// Database configuration
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgresql://simple_ab_testing_user:simple_ab_testing_password@localhost:5432/simple_ab_testing',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Create a connection pool
const pool = new Pool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
};

// Run database migrations
const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    const client = await pool.connect();
    
    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Get list of applied migrations
    const appliedResult = await client.query(
      'SELECT migration_name FROM schema_migrations ORDER BY migration_name'
    );
    const appliedMigrations = new Set(appliedResult.rows.map(row => row.migration_name));
    
    // Get migration files (check multiple possible locations)
    const possibleMigrationDirs = [
      path.join(__dirname, '../migrations'),     // Local dev: api/config -> api/migrations
      path.join(__dirname, 'migrations'),        // Lambda: bundle root -> migrations
      path.join(process.cwd(), 'migrations')     // Alternative: CWD -> migrations
    ];
    
    let migrationsDir = null;
    let migrationFiles = [];
    
    // Find the migrations directory
    for (const dir of possibleMigrationDirs) {
      if (fs.existsSync(dir)) {
        migrationsDir = dir;
        break;
      }
    }
    
    if (!migrationsDir) {
      console.log('No migrations directory found, skipping migrations');
      client.release();
      return;
    }
    
    console.log(`Using migrations directory: ${migrationsDir}`);
    migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    // Run pending migrations
    for (const file of migrationFiles) {
      if (appliedMigrations.has(file)) {
        console.log(`Migration ${file} already applied, skipping`);
        continue;
      }
      
      console.log(`Applying migration: ${file}`);
      const migrationSQL = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      try {
        await client.query('BEGIN');
        await client.query(migrationSQL);
        await client.query(
          'INSERT INTO schema_migrations (migration_name) VALUES ($1)',
          [file]
        );
        await client.query('COMMIT');
        console.log(`Migration ${file} applied successfully`);
      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`Failed to apply migration ${file}:`, error.message);
        throw error;
      }
    }
    
    console.log('All migrations completed successfully');
    client.release();
  } catch (error) {
    console.error('Migration failed:', error.message);
    throw error;
  }
};

// Initialize database with seed data
const seedDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // Create a default project if none exists for the demo API key
    const defaultApiKey = 'demo-api-key-123';
    const defaultProjectCheck = await client.query(
      'SELECT * FROM projects WHERE api_key = $1 LIMIT 1',
      [defaultApiKey]
    );
    
    if (defaultProjectCheck.rows.length === 0) {
      console.log('Creating default project...');
      await client.query(`
        INSERT INTO projects (api_key, project_id, name, url, description)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (api_key, project_id) DO NOTHING
      `, [
        defaultApiKey,
        'default-project',
        'My First Project',
        'http://localhost:8082',
        'Default project for experiments'
      ]);
      console.log('Default project created');
    }
    
    client.release();
  } catch (error) {
    console.error('Database seeding failed:', error.message);
    throw error;
  }
};

// Initialize database (run migrations + seed)
const initializeDatabase = async () => {
  await runMigrations();
  await seedDatabase();
};

export {
  pool,
  testConnection,
  initializeDatabase
};
