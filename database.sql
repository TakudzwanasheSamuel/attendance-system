-- =====================================================
-- Smart Student Monitoring System - Database Schema
-- MySQL Database Setup Script
-- =====================================================

-- Create database
CREATE DATABASE IF NOT EXISTS attendance_system;
USE attendance_system;

-- Drop existing tables if they exist (for clean setup)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS attendancerecord;
DROP TABLE IF EXISTS attendancesession;
DROP TABLE IF EXISTS courseenrollment;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS account;
DROP TABLE IF EXISTS session;
DROP TABLE IF EXISTS verificationtoken;
DROP TABLE IF EXISTS user;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- User Management Tables
-- =====================================================

-- Users table (students, lecturers, admins)
CREATE TABLE user (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NULL,
  email VARCHAR(191) NOT NULL UNIQUE,
  emailVerified DATETIME(3) NULL,
  image VARCHAR(191) NULL,
  password VARCHAR(191) NOT NULL,
  role ENUM('STUDENT', 'LECTURER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  -- Indexes for performance
  INDEX user_email_idx (email),
  INDEX user_role_idx (role),
  INDEX user_created_idx (createdAt)
);

-- Account table (for OAuth providers)
CREATE TABLE account (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  type VARCHAR(191) NOT NULL,
  provider VARCHAR(191) NOT NULL,
  providerAccountId VARCHAR(191) NOT NULL,
  refresh_token TEXT NULL,
  access_token TEXT NULL,
  expires_at INT NULL,
  token_type VARCHAR(191) NULL,
  scope VARCHAR(191) NULL,
  id_token TEXT NULL,
  session_state VARCHAR(191) NULL,
  
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
  UNIQUE KEY Account_provider_providerAccountId_key (provider, providerAccountId)
);

-- Session table (for authentication sessions)
CREATE TABLE session (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  sessionToken VARCHAR(191) NOT NULL UNIQUE,
  userId VARCHAR(191) NOT NULL,
  expires DATETIME(3) NOT NULL,
  
  FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE
);

-- Verification tokens
CREATE TABLE verificationtoken (
  identifier VARCHAR(191) NOT NULL,
  token VARCHAR(191) NOT NULL UNIQUE,
  expires DATETIME(3) NOT NULL,
  
  UNIQUE KEY VerificationToken_identifier_token_key (identifier, token)
);

-- =====================================================
-- Academic Management Tables
-- =====================================================

-- Courses table
CREATE TABLE course (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  code VARCHAR(191) NOT NULL UNIQUE,
  description TEXT NULL,
  lecturerId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (lecturerId) REFERENCES user(id),
  
  -- Indexes for performance
  INDEX course_code_idx (code),
  INDEX course_lecturer_idx (lecturerId),
  INDEX course_created_idx (createdAt)
);

-- Course enrollment table
CREATE TABLE courseenrollment (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  studentId VARCHAR(191) NOT NULL,
  courseId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  FOREIGN KEY (courseId) REFERENCES course(id),
  FOREIGN KEY (studentId) REFERENCES user(id),
  
  -- Prevent duplicate enrollments
  UNIQUE KEY CourseEnrollment_studentId_courseId_key (studentId, courseId),
  
  -- Indexes for performance
  INDEX enrollment_student_idx (studentId),
  INDEX enrollment_course_idx (courseId),
  INDEX enrollment_created_idx (createdAt)
);

-- =====================================================
-- Attendance Management Tables
-- =====================================================

-- Attendance sessions table
CREATE TABLE attendancesession (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  code VARCHAR(191) NOT NULL UNIQUE,
  courseId VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  expiresAt DATETIME(3) NOT NULL,
  
  -- Geofencing fields
  requireLocation BOOLEAN NOT NULL DEFAULT FALSE,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  radiusMeters INT NULL,
  locationName VARCHAR(191) NULL,
  
  FOREIGN KEY (courseId) REFERENCES course(id),
  
  -- Indexes for performance
  INDEX session_code_idx (code),
  INDEX session_course_idx (courseId),
  INDEX session_expires_idx (expiresAt),
  INDEX session_created_idx (createdAt),
  INDEX session_location_idx (requireLocation, latitude, longitude)
);

-- Attendance records table
CREATE TABLE attendancerecord (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  studentId VARCHAR(191) NOT NULL,
  sessionId VARCHAR(191) NOT NULL,
  timestamp DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  -- Location verification fields
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  distance DOUBLE NULL,
  
  -- Verification fields
  ipAddress VARCHAR(191) NULL,
  userAgent TEXT NULL,
  verificationNotes TEXT NULL,
  
  FOREIGN KEY (sessionId) REFERENCES attendancesession(id),
  FOREIGN KEY (studentId) REFERENCES user(id),
  
  -- Prevent duplicate attendance for same session
  UNIQUE KEY AttendanceRecord_studentId_sessionId_key (studentId, sessionId),
  
  -- Indexes for performance
  INDEX attendance_student_idx (studentId),
  INDEX attendance_session_idx (sessionId),
  INDEX attendance_timestamp_idx (timestamp),
  INDEX attendance_student_timestamp_idx (studentId, timestamp)
);

-- =====================================================
-- Sample Data for Testing
-- =====================================================

-- Insert admin user
INSERT INTO user (id, name, email, password, role) VALUES 
('admin001', 'System Administrator', 'admin@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN');

-- Insert sample lecturers
INSERT INTO user (id, name, email, password, role) VALUES 
('lect001', 'Dr. Blessing Moyo', 'blessing.moyo.12@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LECTURER'),
('lect002', 'Prof. Tinashe Chirwa', 'tinashe.chirwa.13@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LECTURER'),
('lect003', 'Dr. Chipo Mukamuri', 'chipo.mukamuri.14@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LECTURER');

-- Insert sample students
INSERT INTO user (id, name, email, password, role) VALUES 
('stud001', 'Tinashe Mazvihwa', 'tinashe.mazvihwa.40@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT'),
('stud002', 'Chiedza Mutasa', 'chiedza.mutasa.41@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT'),
('stud003', 'Takudzwa Samuel', 'takudzwa.samuel.42@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT'),
('stud004', 'Rutendo Mapfumo', 'rutendo.mapfumo.43@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT'),
('stud005', 'Nyasha Chikwanha', 'nyasha.chikwanha.44@msu.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'STUDENT');

-- Insert sample courses
INSERT INTO course (id, name, code, description, lecturerId) VALUES 
('course001', 'Web Development', 'CS2101', 'Introduction to modern web development with React and Node.js', 'lect001'),
('course002', 'Database Systems', 'CS2102', 'Relational databases, SQL, and database design principles', 'lect001'),
('course003', 'Cybersecurity Fundamentals', 'CS3101', 'Network security, cryptography, and ethical hacking', 'lect002'),
('course004', 'Mobile App Development', 'CS3102', 'iOS and Android development with React Native', 'lect002'),
('course005', 'Data Structures & Algorithms', 'CS1101', 'Fundamental computer science concepts and problem solving', 'lect003');

-- Insert sample course enrollments
INSERT INTO courseenrollment (id, studentId, courseId) VALUES 
('enroll001', 'stud001', 'course001'),
('enroll002', 'stud001', 'course002'),
('enroll003', 'stud001', 'course003'),
('enroll004', 'stud002', 'course001'),
('enroll005', 'stud002', 'course004'),
('enroll006', 'stud003', 'course002'),
('enroll007', 'stud003', 'course003'),
('enroll008', 'stud003', 'course005'),
('enroll009', 'stud004', 'course001'),
('enroll010', 'stud004', 'course005'),
('enroll011', 'stud005', 'course003'),
('enroll012', 'stud005', 'course004');

-- Insert sample attendance sessions (including geofenced ones)
INSERT INTO attendancesession (id, code, courseId, expiresAt, requireLocation, latitude, longitude, radiusMeters, locationName) VALUES 
('session001', 'WEB001', 'course001', DATE_ADD(NOW(), INTERVAL 2 HOUR), TRUE, -19.4543, 29.8175, 100, 'MSU Gweru Main Campus'),
('session002', 'DB001', 'course002', DATE_ADD(NOW(), INTERVAL 1 HOUR), TRUE, -19.4545, 29.8180, 75, 'MSU Gweru Library'),
('session003', 'SEC001', 'course003', DATE_ADD(NOW(), INTERVAL 3 HOUR), TRUE, -19.4540, 29.8170, 80, 'MSU Gweru Engineering Faculty'),
('session004', 'MOB001', 'course004', DATE_ADD(NOW(), INTERVAL 4 HOUR), FALSE, NULL, NULL, NULL, NULL),
('session005', 'ALG001', 'course005', DATE_ADD(NOW(), INTERVAL 5 HOUR), TRUE, -19.4548, 29.8185, 90, 'MSU Gweru Science Faculty');

-- Insert sample attendance records
INSERT INTO attendancerecord (id, studentId, sessionId, latitude, longitude, distance, ipAddress) VALUES 
('attend001', 'stud001', 'session001', -19.4542, 29.8176, 15.2, '192.168.1.100'),
('attend002', 'stud002', 'session001', -19.4544, 29.8174, 8.7, '192.168.1.101'),
('attend003', 'stud004', 'session001', -19.4541, 29.8177, 12.3, '192.168.1.102'),
('attend004', 'stud001', 'session002', -19.4546, 29.8181, 18.9, '192.168.1.100'),
('attend005', 'stud003', 'session002', -19.4544, 29.8179, 11.4, '192.168.1.103'),
('attend006', 'stud001', 'session003', -19.4539, 29.8171, 14.7, '192.168.1.100'),
('attend007', 'stud003', 'session003', -19.4541, 29.8169, 9.2, '192.168.1.103'),
('attend008', 'stud005', 'session003', -19.4538, 29.8172, 16.8, '192.168.1.105');

-- =====================================================
-- MSU Gweru Campus Geofencing Locations
-- =====================================================

-- Note: These are the configured geofencing locations for MSU Gweru:
-- Main Campus: -19.4543, 29.8175 (150m radius)
-- Library: -19.4545, 29.8180 (75m radius)  
-- Engineering Faculty: -19.4540, 29.8170 (80m radius)
-- Science Faculty: -19.4548, 29.8185 (80m radius)
-- Administrative Building: -19.4541, 29.8178 (50m radius)

-- =====================================================
-- Performance Indexes (Already included above)
-- =====================================================

-- Additional composite indexes for complex queries
CREATE INDEX attendance_course_timestamp_idx ON attendancerecord (sessionId, timestamp);
CREATE INDEX enrollment_student_course_idx ON courseenrollment (studentId, courseId);
CREATE INDEX session_course_expires_idx ON attendancesession (courseId, expiresAt);

-- =====================================================
-- Database Setup Complete
-- =====================================================

-- Display setup summary
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as total_users FROM user;
SELECT COUNT(*) as total_courses FROM course;
SELECT COUNT(*) as total_enrollments FROM courseenrollment;
SELECT COUNT(*) as total_sessions FROM attendancesession;
SELECT COUNT(*) as total_attendance FROM attendancerecord;

-- Display demo accounts
SELECT 'Demo Accounts:' as info;
SELECT role, email, 'password123' as password FROM user WHERE email IN ('admin@msu.com', 'tinashe.mazvihwa.40@msu.com', 'blessing.moyo.12@msu.com');
