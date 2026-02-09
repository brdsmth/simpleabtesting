-- Migration: 004_add_password_auth.sql
-- Description: Add password authentication to users table

-- Add password_hash column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

-- Remove magic tokens table (no longer needed)
DROP TABLE IF EXISTS magic_tokens;
