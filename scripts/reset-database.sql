-- =====================================================
-- Database Reset Script
-- This will completely reset the attendance_system database
-- =====================================================

-- Drop the existing database completely
DROP DATABASE IF EXISTS attendance_system;

-- Create a fresh database
CREATE DATABASE attendance_system;

-- Use the new database
USE attendance_system;

-- Confirm reset
SELECT 'Database reset complete - ready for Prisma schema' as status;
