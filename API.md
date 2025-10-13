# API Documentation

## Overview

The Smart Student Monitoring System provides a comprehensive REST API for attendance management, real-time tracking, and system administration.

**Base URL:** `http://localhost:9002/api`  
**Authentication:** JWT tokens via HTTP-only cookies  
**Content-Type:** `application/json`

## Authentication Endpoints

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "student@msu.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "redirectTo": "/student/dashboard"
}
```

## Attendance Management

### POST `/attendance/mark`
Mark attendance for a session.

**Request Body:**
```json
{
  "sessionId": "session_id",
  "email": "student@msu.com",
  "password": "password123",
  "latitude": -17.8252,
  "longitude": 31.0335
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "record": {
    "id": "record_id",
    "timestamp": "2025-10-13T10:30:00Z",
    "status": "Present"
  }
}
```

### GET `/sessions/{sessionId}/live`
**Real-time attendance tracking via Server-Sent Events.**

**Headers:**
- `Accept: text/event-stream`
- `Cache-Control: no-cache`

**Response Stream:**
```
data: {"sessionId":"abc123","count":5,"records":[...],"lastUpdate":"2025-10-13T10:30:00Z"}

data: {"sessionId":"abc123","count":6,"records":[...],"lastUpdate":"2025-10-13T10:30:15Z"}
```

## Course Management

### POST `/courses/enroll`
Enroll a student in a course.

**Request Body:**
```json
{
  "courseId": "course_id",
  "studentId": "student_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully enrolled in Course Name",
  "enrollment": {
    "courseId": "course_id",
    "courseName": "Course Name",
    "courseCode": "CS101",
    "studentName": "Student Name",
    "enrolledAt": "2025-10-13T10:30:00Z"
  }
}
```

## Data Export

### GET `/export/attendance`
Export attendance data in CSV or JSON format.

**Query Parameters:**
- `format`: `csv` or `json` (default: `csv`)
- `courseId`: Filter by course ID (optional)
- `sessionId`: Filter by session ID (optional)
- `startDate`: Start date filter (ISO format, optional)
- `endDate`: End date filter (ISO format, optional)

**Example:**
```
GET /api/export/attendance?format=csv&courseId=course123&startDate=2025-10-01
```

**CSV Response:**
```csv
Student Name,Student Email,Course Name,Course Code,Session Code,Lecturer,Attendance Status,Timestamp,Session Date
John Doe,john@msu.com,Mathematics,MATH101,ABC123,Dr. Smith,Present,2025-10-13T10:30:00Z,2025-10-13
```

**JSON Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 150,
  "exportedAt": "2025-10-13T10:30:00Z"
}
```

## Session Management

### POST `/sessions/find`
Find a session by session code.

**Request Body:**
```json
{
  "code": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "session_id",
  "sessionCode": "ABC123",
  "courseName": "Course Name",
  "courseCode": "CS101",
  "expiresAt": "2025-10-13T12:00:00Z"
}
```

## System Monitoring

### GET `/health`
System health check and performance metrics.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-13T10:30:00Z",
  "version": "3.0.0",
  "uptime": 86400,
  "database": {
    "status": "connected",
    "responseTime": "15ms"
  },
  "stats": {
    "users": 1250,
    "courses": 45,
    "totalSessions": 890,
    "activeSessions": 12,
    "attendanceRecords": 15420
  },
  "performance": {
    "responseTime": "25ms",
    "memoryUsage": {
      "rss": 52428800,
      "heapTotal": 29360128,
      "heapUsed": 18874560
    },
    "nodeVersion": "v20.0.0"
  }
}
```

## Administrative Operations

### POST `/admin/batch`
**Admin only** - Perform batch operations.

**Request Body:**
```json
{
  "operation": "bulk_enroll_students",
  "data": {
    "courseId": "course_id",
    "studentIds": ["student1", "student2", "student3"]
  }
}
```

**Available Operations:**
- `bulk_enroll_students` - Enroll multiple students in a course
- `bulk_create_users` - Create multiple users at once
- `bulk_assign_courses` - Assign courses to lecturers
- `cleanup_expired_sessions` - Remove old expired sessions

**Response:**
```json
{
  "success": true,
  "operation": "bulk_enroll_students",
  "result": {
    "operation": "bulk_enroll_students",
    "enrolled": 3,
    "courseId": "course_id",
    "studentCount": 3
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-13T10:30:00Z"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- **General API:** 100 requests per minute per IP
- **Real-time SSE:** 1 connection per session per user
- **Export API:** 10 requests per hour per user
- **Health Check:** Unlimited

## Authentication

All protected endpoints require a valid JWT token sent as an HTTP-only cookie named `auth-token`. The token contains:

```json
{
  "id": "user_id",
  "email": "user@msu.com",
  "role": "STUDENT|LECTURER|ADMIN",
  "name": "User Name",
  "exp": 1697184000
}
```

## Real-Time Features

The system supports real-time updates through:

1. **Server-Sent Events (SSE)** - For live attendance tracking
2. **Automatic Reconnection** - Client-side reconnection on connection loss
3. **Connection Status** - Visual indicators for online/offline status
4. **Keep-Alive** - 30-second keep-alive messages

## Performance

- **Average Response Time:** < 100ms
- **Database Query Time:** < 50ms (with caching)
- **Real-time Update Latency:** < 5 seconds
- **Cache Hit Rate:** > 80%
- **Concurrent Users:** 1000+ supported
