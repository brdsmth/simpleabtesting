import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

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

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('Initializing database tables...');
    const client = await pool.connect();
    
    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        project_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500),
        description TEXT,
        settings JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(api_key, project_id)
      )
    `);
    
    // Create experiments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiments (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        project_id VARCHAR(255),
        experiment_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        variants JSONB NOT NULL,
        traffic_allocation JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(api_key, experiment_id)
      )
    `);

    // Create analytics_events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
        experiment_id VARCHAR(255),
        variant VARCHAR(255),
        event_type VARCHAR(255) NOT NULL,
        event_data JSONB,
        user_id VARCHAR(255),
        session_id VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_experiments_api_key ON experiments(api_key);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_experiments_project_id ON experiments(project_id);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_api_key ON analytics_events(api_key);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_experiment_id ON analytics_events(experiment_id);
    `);

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

      // Update existing experiments to link to default project
      await client.query(`
        UPDATE experiments 
        SET project_id = 'default-project' 
        WHERE api_key = $1 AND project_id IS NULL
      `, [defaultApiKey]);
      
      console.log('Default project created and linked to existing experiments');
    }

    console.log('Database tables initialized successfully');
    client.release();
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    throw error;
  }
};

export {
  pool,
  testConnection,
  initializeDatabase
};
