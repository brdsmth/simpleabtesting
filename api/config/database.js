const { Pool } = require('pg');
require('dotenv').config();

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
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🔧 Initializing database tables...');
    const client = await pool.connect();
    
    // Create experiments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS experiments (
        id SERIAL PRIMARY KEY,
        api_key VARCHAR(255) NOT NULL,
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
      CREATE INDEX IF NOT EXISTS idx_experiments_api_key ON experiments(api_key);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_api_key ON analytics_events(api_key);
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_experiment_id ON analytics_events(experiment_id);
    `);

    console.log('✅ Database tables initialized successfully');
    client.release();
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
