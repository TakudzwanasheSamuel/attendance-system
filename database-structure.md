# Database Structure

This document outlines the proposed database structure for the Smart Student Monitoring System. A NoSQL database like Google Cloud Firestore is recommended, as its document-collection model is well-suited for this application's data relationships.

Below are the proposed collections and the schema for the documents within them.

## Collections

### `users`

Stores information about all individuals who can log into the system. A `role` field distinguishes between students, lecturers, and admins.

- **Path**: `/users/{userId}`

**Document Schema:**
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string ('student' | 'lecturer' | 'admin')"
}
```

### `courses`

Stores information about all courses offered. It includes a reference to the lecturer teaching it and a list of enrolled student IDs.

- **Path**: `/courses/{courseId}`

**Document Schema:**
```json
{
  "id": "string",
  "name": "string",
  "code": "string",
  "lecturerId": "string", // Foreign Key to a user document in the 'users' collection
  "enrolledStudentIds": ["string"] // Array of user IDs from the 'users' collection
}
```

### `attendanceSessions`

A collection to store every attendance session created by a lecturer for a specific course.

- **Path**: `/attendanceSessions/{sessionId}`

**Document Schema:**
```json
{
  "id": "string",
  "courseId": "string", // Foreign Key to a document in the 'courses' collection
  "code": "string", // The unique code for this session
  "createdAt": "timestamp", // The time the session was created
  "expiresAt": "timestamp" // The time the session code is no longer valid
}
```

### `attendanceRecords`

This collection logs each time a student successfully marks their attendance for a session. It links a student to a specific session.

- **Path**: `/attendanceRecords/{recordId}`

**Document Schema:**
```json
{
  "id": "string",
  "sessionId": "string", // Foreign Key to a document in the 'attendanceSessions' collection
  "studentId": "string", // Foreign Key to a user document in the 'users' collection
  "timestamp": "timestamp", // The time the student marked their attendance
  "status": "string ('Present')"
}
```
