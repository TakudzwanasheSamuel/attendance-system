# Database Structure (MySQL)

This document outlines the proposed database structure for the Smart Student Monitoring System using a relational database like MySQL. An Object-Relational Mapper (ORM) like Prisma is recommended for interacting with the database.

Below are the proposed tables and the schema for each.

## Tables

### `User`

Stores information about all individuals who can log into the system. A `role` field distinguishes between students, lecturers, and admins.

**SQL Schema:**
```sql
CREATE TABLE User (
    id        String   @id @default(cuid())
    name      String
    email     String   @unique
    password  String   -- Hashed password
    role      Role     @default(STUDENT)
    courses   Course[] @relation("CourseToLecturer")
    enrollments CourseEnrollment[]
    records   AttendanceRecord[]
);

enum Role {
    STUDENT
    LECTURER
    ADMIN
}
```

### `Course`

Stores information about all courses offered. It includes a reference to the lecturer teaching it.

**SQL Schema:**
```sql
CREATE TABLE Course (
    id          String   @id @default(cuid())
    name        String
    code        String   @unique
    lecturer    User     @relation("CourseToLecturer", fields: [lecturerId], references: [id])
    lecturerId  String
    enrollments CourseEnrollment[]
    sessions    AttendanceSession[]
);
```

### `CourseEnrollment`

A join table to manage the many-to-many relationship between students and courses.

**SQL Schema:**
```sql
CREATE TABLE CourseEnrollment (
    student   User     @relation(fields: [studentId], references: [id])
    studentId String
    course    Course   @relation(fields: [courseId], references: [id])
    courseId  String
    createdAt DateTime @default(now())

    @@id([studentId, courseId])
);
```

### `AttendanceSession`

A table to store every attendance session created by a lecturer for a specific course.

**SQL Schema:**
```sql
CREATE TABLE AttendanceSession (
    id        String   @id @default(cuid())
    course    Course   @relation(fields: [courseId], references: [id])
    courseId  String
    code      String   @unique
    createdAt DateTime @default(now())
    expiresAt DateTime
    records   AttendanceRecord[]
);
```

### `AttendanceRecord`

This table logs each time a student successfully marks their attendance for a session.

**SQL Schema:**
```sql
CREATE TABLE AttendanceRecord (
    id        String            @id @default(cuid())
    session   AttendanceSession @relation(fields: [sessionId], references: [id])
    sessionId String
    student   User              @relation(fields: [studentId], references: [id])
    studentId String
    timestamp DateTime          @default(now())
    status    String            @default("Present") -- e.g., 'Present', 'Late'

    @@unique([sessionId, studentId])
);
```
