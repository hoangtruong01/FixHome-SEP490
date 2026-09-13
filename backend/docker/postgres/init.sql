-- FixHome Database Initialization
-- This script runs when PostgreSQL container starts for the first time

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Confirm initialization
SELECT 'FixHome database initialized successfully' AS status;
