export interface Student {
  id: string;
  name: string;
  email: string;
}

export interface Lecturer {
  id: string;
  name: string;
  email: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  lecturerId: string;
  enrolledStudentIds: string[];
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  code: string;
  createdAt: Date;
  expiresAt: Date;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  timestamp: Date;
  status: 'Present' | 'Absent';
}
