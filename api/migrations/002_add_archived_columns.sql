-- Migration: 002_add_archived_columns.sql
-- Description: Add archived columns to projects and experiments for soft delete

-- Add archived column to projects (if not exists)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Add archived column to experiments (if not exists)
ALTER TABLE experiments ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE;

-- Create indexes on archived columns
CREATE INDEX IF NOT EXISTS idx_projects_archived ON projects(archived);
CREATE INDEX IF NOT EXISTS idx_experiments_archived ON experiments(archived);
