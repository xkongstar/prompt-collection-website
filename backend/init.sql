-- PostgreSQL initialization script
-- This script runs when the database container starts for the first time

-- Create database (if not exists)
SELECT 'CREATE DATABASE promptdb' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'promptdb');

-- Connect to the database
\c promptdb;

-- Create user (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'promptuser') THEN
        CREATE USER promptuser WITH PASSWORD 'promptpass123';
    END IF;
END
$$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE promptdb TO promptuser;
GRANT ALL ON SCHEMA public TO promptuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO promptuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO promptuser;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO promptuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO promptuser;
