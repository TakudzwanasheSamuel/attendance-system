-- Smart Student Monitoring System Database Setup
-- Run this script in MySQL to create the database and tables

-- Create the database
CREATE DATABASE IF NOT EXISTS smart_student_monitoring;
USE smart_student_monitoring;

-- Create User table
CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(191) NOT NULL,
  `role` ENUM('STUDENT', 'LECTURER', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  `emailVerified` DATETIME(3) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Course table
CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `lecturerId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Course_code_key` (`code`),
  KEY `Course_lecturerId_fkey` (`lecturerId`),
  CONSTRAINT `Course_lecturerId_fkey` FOREIGN KEY (`lecturerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create CourseEnrollment table
CREATE TABLE IF NOT EXISTS `CourseEnrollment` (
  `studentId` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`studentId`, `courseId`),
  KEY `CourseEnrollment_courseId_fkey` (`courseId`),
  CONSTRAINT `CourseEnrollment_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `CourseEnrollment_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create AttendanceSession table
CREATE TABLE IF NOT EXISTS `AttendanceSession` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AttendanceSession_code_key` (`code`),
  KEY `AttendanceSession_courseId_fkey` (`courseId`),
  CONSTRAINT `AttendanceSession_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create AttendanceRecord table
CREATE TABLE IF NOT EXISTS `AttendanceRecord` (
  `id` VARCHAR(191) NOT NULL,
  `sessionId` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `status` VARCHAR(191) NOT NULL DEFAULT 'Present',
  PRIMARY KEY (`id`),
  UNIQUE KEY `AttendanceRecord_sessionId_studentId_key` (`sessionId`, `studentId`),
  KEY `AttendanceRecord_studentId_fkey` (`studentId`),
  CONSTRAINT `AttendanceRecord_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `AttendanceSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `AttendanceRecord_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Account table (for NextAuth.js)
CREATE TABLE IF NOT EXISTS `Account` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `refresh_token` TEXT NULL,
  `access_token` TEXT NULL,
  `expires_at` INT NULL,
  `token_type` VARCHAR(191) NULL,
  `scope` VARCHAR(191) NULL,
  `id_token` TEXT NULL,
  `session_state` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Account_provider_providerAccountId_key` (`provider`, `providerAccountId`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create Session table (for NextAuth.js)
CREATE TABLE IF NOT EXISTS `Session` (
  `id` VARCHAR(191) NOT NULL,
  `sessionToken` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  KEY `Session_userId_fkey` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create VerificationToken table (for NextAuth.js)
CREATE TABLE IF NOT EXISTS `VerificationToken` (
  `identifier` VARCHAR(191) NOT NULL,
  `token` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,
  PRIMARY KEY (`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert demo data
-- Admin user (password: admin123)
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`) VALUES 
('admin-1', 'System Admin', 'admin@example.com', '$2b$10$2dLU3bvC9rMxaZxTvcg9XOV3hl8MrOnj911FzxKc6YIwjFA0Fo2Q2', 'ADMIN');

-- Lecturer user (password: lecturer123)
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`) VALUES 
('lecturer-1', 'Dr. Evelyn Davis', 'lecturer@example.com', '$2b$10$s3K6mZ8VNAYk2wrPJPxjPeZGGHv/XFWAIP5D1B9i7DO1SsT3CV/uS', 'LECTURER');

-- Student users (password: student123)
INSERT INTO `User` (`id`, `name`, `email`, `password`, `role`) VALUES 
('student-1', 'Alice Johnson', 'student@example.com', '$2b$10$b6glxlIHTatmeXvIsyVAkOx6UuZtZLZuDkPd9DjBTcp4ZrfaVjYSa', 'STUDENT'),
('student-2', 'Bob Williams', 'bob@example.com', '$2b$10$b6glxlIHTatmeXvIsyVAkOx6UuZtZLZuDkPd9DjBTcp4ZrfaVjYSa', 'STUDENT'),
('student-3', 'Charlie Brown', 'charlie@example.com', '$2b$10$b6glxlIHTatmeXvIsyVAkOx6UuZtZLZuDkPd9DjBTcp4ZrfaVjYSa', 'STUDENT'),
('student-4', 'Diana Miller', 'diana@example.com', '$2b$10$b6glxlIHTatmeXvIsyVAkOx6UuZtZLZuDkPd9DjBTcp4ZrfaVjYSa', 'STUDENT');

-- Create courses
INSERT INTO `Course` (`id`, `name`, `code`, `lecturerId`) VALUES 
('course-1', 'Advanced Web Development', 'CS449', 'lecturer-1'),
('course-2', 'Introduction to AI', 'CS580', 'lecturer-1'),
('course-3', 'Database Systems', 'CS317', 'lecturer-1');

-- Create course enrollments
INSERT INTO `CourseEnrollment` (`studentId`, `courseId`) VALUES 
('student-1', 'course-1'),
('student-2', 'course-1'),
('student-3', 'course-1'),
('student-4', 'course-1'),
('student-1', 'course-2'),
('student-3', 'course-2'),
('student-2', 'course-3'),
('student-4', 'course-3');

-- Create attendance sessions
INSERT INTO `AttendanceSession` (`id`, `courseId`, `code`, `createdAt`, `expiresAt`) VALUES 
('session-1', 'course-1', 'ACTIVE123', NOW(), DATE_ADD(NOW(), INTERVAL 5 MINUTE)),
('session-2', 'course-1', 'PAST456', '2024-05-20 10:00:00', '2024-05-20 10:15:00'),
('session-3', 'course-1', 'PAST789', '2024-05-18 10:00:00', '2024-05-18 10:15:00');

-- Create attendance records
INSERT INTO `AttendanceRecord` (`id`, `sessionId`, `studentId`, `timestamp`, `status`) VALUES 
('rec-1', 'session-1', 'student-1', DATE_SUB(NOW(), INTERVAL 8 MINUTE), 'Present'),
('rec-2', 'session-1', 'student-3', DATE_SUB(NOW(), INTERVAL 5 MINUTE), 'Present'),
('rec-3', 'session-2', 'student-1', '2024-05-20 10:05:00', 'Present'),
('rec-4', 'session-2', 'student-2', '2024-05-20 10:07:00', 'Present'),
('rec-5', 'session-2', 'student-3', '2024-05-20 10:02:00', 'Present'),
('rec-6', 'session-3', 'student-1', '2024-05-18 10:10:00', 'Present'),
('rec-7', 'session-3', 'student-4', '2024-05-18 10:11:00', 'Present');

-- Show completion message
SELECT 'Database setup completed successfully!' as message;
