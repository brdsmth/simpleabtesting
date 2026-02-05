-- Migration: 001_initial_schema.sql
-- Description: Create initial tables for projects, experiments, and analytics

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL,
  project_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  description TEXT,
  settings JSONB DEFAULT '{}',
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(api_key, project_id)
);

-- Create experiments table
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
  archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(api_key, experiment_id)
);

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  api_key VARCHAR(255) NOT NULL,
  project_id VARCHAR(255),
  experiment_id VARCHAR(255),
  variant VARCHAR(255),
  event_type VARCHAR(255) NOT NULL,
  event_data JSONB,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
CREATE INDEX IF NOT EXISTS idx_experiments_api_key ON experiments(api_key);
CREATE INDEX IF NOT EXISTS idx_experiments_project_id ON experiments(project_id);
CREATE INDEX IF NOT EXISTS idx_experiments_archived ON experiments(archived);
CREATE INDEX IF NOT EXISTS idx_analytics_api_key ON analytics_events(api_key);
CREATE INDEX IF NOT EXISTS idx_analytics_project_id ON analytics_events(project_id);
CREATE INDEX IF NOT EXISTS idx_analytics_experiment_id ON analytics_events(experiment_id);
