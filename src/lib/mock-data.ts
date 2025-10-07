import type { Student, Lecturer, Course, AttendanceSession, AttendanceRecord } from './types';

export const students: Student[] = [
  { id: 'student-1', name: 'Alice Johnson', email: 'alice@example.com' },
  { id: 'student-2', name: 'Bob Williams', email: 'bob@example.com' },
  { id: 'student-3', name: 'Charlie Brown', email: 'charlie@example.com' },
  { id: 'student-4', name: 'Diana Miller', email: 'diana@example.com' },
];

export const lecturers: Lecturer[] = [
  { id: 'lecturer-1', name: 'Dr. Evelyn Davis', email: 'lecturer@example.com' },
];

export const courses: Course[] = [
  {
    id: 'course-1',
    name: 'Advanced Web Development',
    code: 'CS449',
    lecturerId: 'lecturer-1',
    enrolledStudentIds: ['student-1', 'student-2', 'student-3', 'student-4'],
  },
  {
    id: 'course-2',
    name: 'Introduction to AI',
    code: 'CS580',
    lecturerId: 'lecturer-1',
    enrolledStudentIds: ['student-1', 'student-3'],
  },
  {
    id: 'course-3',
    name: 'Database Systems',
    code: 'CS317',
    lecturerId: 'lecturer-1',
    enrolledStudentIds: ['student-2', 'student-4'],
  },
];

export const attendanceSessions: AttendanceSession[] = [
  {
    id: 'session-1',
    courseId: 'course-1',
    code: 'ACTIVE123',
    createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
  },
  {
    id: 'session-2',
    courseId: 'course-1',
    code: 'PAST456',
    createdAt: new Date('2024-05-20T10:00:00Z'),
    expiresAt: new Date('2024-05-20T10:15:00Z'),
  },
  {
    id: 'session-3',
    courseId: 'course-1',
    code: 'PAST789',
    createdAt: new Date('2024-05-18T10:00:00Z'),
    expiresAt: new Date('2024-05-18T10:15:00Z'),
  },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'rec-1', sessionId: 'session-1', studentId: 'student-1', timestamp: new Date(Date.now() - 8 * 60 * 1000), status: 'Present' },
  { id: 'rec-2', sessionId: 'session-1', studentId: 'student-3', timestamp: new Date(Date.now() - 5 * 60 * 1000), status: 'Present' },
  { id: 'rec-3', sessionId: 'session-2', studentId: 'student-1', timestamp: new Date('2024-05-20T10:05:00Z'), status: 'Present' },
  { id: 'rec-4', sessionId: 'session-2', studentId: 'student-2', timestamp: new Date('2024-05-20T10:07:00Z'), status: 'Present' },
  { id: 'rec-5', sessionId: 'session-2', studentId: 'student-3', timestamp: new Date('2024-05-20T10:02:00Z'), status: 'Present' },
  { id: 'rec-6', sessionId: 'session-3', studentId: 'student-1', timestamp: new Date('2024-05-18T10:10:00Z'), status: 'Present' },
  { id: 'rec-7', sessionId: 'session-3', studentId: 'student-4', timestamp: new Date('2024-05-18T10:11:00Z'), status: 'Present' },
];

export const getStudentAttendanceHistory = (studentId: string) => {
  const studentCourses = courses.filter(c => c.enrolledStudentIds.includes(studentId));
  const history: { course: Course, session: AttendanceSession, record?: AttendanceRecord }[] = [];

  studentCourses.forEach(course => {
    const courseSessions = attendanceSessions.filter(s => s.courseId === course.id);
    courseSessions.forEach(session => {
      const record = attendanceRecords.find(r => r.sessionId === session.id && r.studentId === studentId);
      history.push({
        course,
        session,
        record: record ? { ...record, status: 'Present' } : undefined,
      });
    });
  });

  return history.map(h => ({
    courseName: h.course.name,
    date: h.session.createdAt,
    status: h.record ? 'Present' : 'Absent',
  })).sort((a,b) => b.date.getTime() - a.date.getTime());
};

export const getCourseAttendanceReport = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return [];

    const courseStudents = students.filter(s => course.enrolledStudentIds.includes(s.id));
    const courseSessions = attendanceSessions.filter(s => s.courseId === courseId && s.expiresAt < new Date());
    
    if (courseSessions.length === 0) {
        return courseStudents.map(student => ({
            name: student.name,
            attended: 0,
            total: 0,
            percentage: 0,
        }));
    }

    return courseStudents.map(student => {
        const attendedCount = courseSessions.filter(session => 
            attendanceRecords.some(record => record.sessionId === session.id && record.studentId === student.id)
        ).length;
        
        const totalSessions = courseSessions.length;
        const percentage = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

        return {
            name: student.name,
            attended: attendedCount,
            total: totalSessions,
            percentage: Math.round(percentage),
        }
    });
};
