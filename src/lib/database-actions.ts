"use server";

import { prisma } from './prisma';
import { user_role } from '@prisma/client';
import { hashPassword } from './auth';

// Simple unique id generator similar to the one used in session creation
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

// User Management Actions
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: user_role;
}) {
  const hashedPassword = await hashPassword(data.password);
  
  return prisma.user.create({
    data: {
      id: generateId(),
      ...data,
      password: hashedPassword
    }
  });
}

export async function updateUser(id: string, data: {
  name?: string;
  email?: string;
  password?: string;
  role?: user_role;
}) {
  const updateData: any = { ...data };
  
  if (data.password) {
    updateData.password = await hashPassword(data.password);
  }
  
  return prisma.user.update({
    where: { id },
    data: updateData
  });
}

export async function deleteUser(id: string) {
  return prisma.user.delete({
    where: { id }
  });
}

export async function getAllUsers() {
  return prisma.user.findMany({
    orderBy: { name: 'asc' }
  });
}

// Course Management Actions
export async function createCourse(data: {
  name: string;
  code: string;
  lecturerId: string;
  enrolledStudentIds?: string[];
}) {
  const course = await prisma.course.create({
    data: {
      id: generateId(),
      name: data.name,
      code: data.code,
      lecturerId: data.lecturerId
    }
  });

  // Create enrollments if students are provided
  if (data.enrolledStudentIds && data.enrolledStudentIds.length > 0) {
    await prisma.courseenrollment.createMany({
      data: data.enrolledStudentIds.map(studentId => ({
        studentId,
        courseId: course.id
      }))
    });
  }

  return course;
}

export async function updateCourse(id: string, data: {
  name?: string;
  code?: string;
  lecturerId?: string;
  enrolledStudentIds?: string[];
}) {
  const updateData: any = { ...data };
  delete updateData.enrolledStudentIds;

  const course = await prisma.course.update({
    where: { id },
    data: updateData
  });

  // Update enrollments if provided
  if (data.enrolledStudentIds !== undefined) {
    // Remove existing enrollments
    await prisma.courseenrollment.deleteMany({
      where: { courseId: id }
    });

    // Create new enrollments
    if (data.enrolledStudentIds.length > 0) {
      await prisma.courseenrollment.createMany({
        data: data.enrolledStudentIds.map(studentId => ({
          studentId,
          courseId: id
        }))
      });
    }
  }

  return course;
}

export async function deleteCourse(id: string) {
  return prisma.course.delete({
    where: { id }
  });
}

export async function getAllCourses() {
  return prisma.course.findMany({
    include: {
      user: true,
      courseenrollment: {
        include: {
          user: true
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

// Attendance Session Actions
export async function createAttendanceSession(data: {
  courseId: string;
  code: string;
  expiresAt: Date;
}) {
  return prisma.attendancesession.create({
    data: {
      id: generateId(),
      ...data
    }
  });
}

export async function getActiveSessions(courseId?: string) {
  const whereClause: any = {
    expiresAt: { gt: new Date() }
  };
  
  if (courseId) {
    whereClause.courseId = courseId;
  }

  return prisma.attendancesession.findMany({
    where: whereClause,
    include: {
      course: true,
      attendancerecord: {
        include: {
          user: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Attendance Record Actions
export async function markAttendance(data: {
  sessionId: string;
  studentId: string;
  status?: string;
}) {
  return prisma.attendancerecord.upsert({
    where: {
      sessionId_studentId: {
        sessionId: data.sessionId,
        studentId: data.studentId
      }
    },
    update: {
      status: data.status || 'Present',
      timestamp: new Date()
    },
    create: {
      id: generateId(),
      sessionId: data.sessionId,
      studentId: data.studentId,
      status: data.status || 'Present'
    }
  });
}

export async function getStudentAttendanceHistory(studentId: string) {
  return prisma.attendancerecord.findMany({
    where: { studentId },
    include: {
      attendancesession: {
        include: {
          course: true
        }
      },
      user: true
    },
    orderBy: { timestamp: 'desc' }
  });
}

export async function getCourseAttendanceReport(courseId: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      courseenrollment: {
        include: {
          user: true
        }
      },
      attendancesession: {
        where: {
          expiresAt: { lt: new Date() }
        },
        include: {
          attendancerecord: true
        }
      }
    }
  });

  if (!course) return [];

  const students = course.courseenrollment.map((e: any) => e.user);
  const sessions = course.attendancesession;

  return students.map((student: any) => {
    const attendedCount = sessions.filter((session: any) => 
      session.attendancerecord?.some((record: any) => record.studentId === student.id)
    ).length;
    
    const totalSessions = sessions.length;
    const percentage = totalSessions > 0 ? (attendedCount / totalSessions) * 100 : 0;

    return {
      name: student.name,
      attended: attendedCount,
      total: totalSessions,
      percentage: Math.round(percentage),
    };
  });
}
