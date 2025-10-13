import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { invalidateCache } from '@/lib/cache';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const userPayload = verifyToken(token);
    
    if (!userPayload || userPayload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { operation, data } = await request.json();

    let result;

    switch (operation) {
      case 'bulk_enroll_students':
        result = await bulkEnrollStudents(data);
        break;
      
      case 'bulk_create_users':
        result = await bulkCreateUsers(data);
        break;
      
      case 'bulk_assign_courses':
        result = await bulkAssignCourses(data);
        break;
      
      case 'cleanup_expired_sessions':
        result = await cleanupExpiredSessions();
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    // Clear relevant caches
    invalidateCache('');

    return NextResponse.json({
      success: true,
      operation,
      result
    });

  } catch (error) {
    console.error('Batch operation error:', error);
    return NextResponse.json(
      { error: 'Batch operation failed' },
      { status: 500 }
    );
  }
}

async function bulkEnrollStudents(data: { courseId: string; studentIds: string[] }) {
  const { courseId, studentIds } = data;
  
  const enrollments = studentIds.map(studentId => ({
    studentId,
    courseId,
    createdAt: new Date()
  }));

  const result = await prisma.courseenrollment.createMany({
    data: enrollments,
    skipDuplicates: true
  });

  return {
    operation: 'bulk_enroll_students',
    enrolled: result.count,
    courseId,
    studentCount: studentIds.length
  };
}

async function bulkCreateUsers(data: { users: Array<{ name: string; email: string; role: string }> }) {
  const { users } = data;
  
  const usersWithIds = users.map(user => ({
    id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    ...user,
    password: '$2a$12$defaulthashedpassword', // Default password hash
    role: user.role.toUpperCase() as any
  }));

  const result = await prisma.user.createMany({
    data: usersWithIds,
    skipDuplicates: true
  });

  return {
    operation: 'bulk_create_users',
    created: result.count,
    total: users.length
  };
}

async function bulkAssignCourses(data: { assignments: Array<{ courseId: string; lecturerId: string }> }) {
  const { assignments } = data;
  
  const updates = await Promise.all(
    assignments.map(({ courseId, lecturerId }) =>
      prisma.course.update({
        where: { id: courseId },
        data: { lecturerId }
      })
    )
  );

  return {
    operation: 'bulk_assign_courses',
    updated: updates.length,
    assignments: assignments.length
  };
}

async function cleanupExpiredSessions() {
  const result = await prisma.attendancesession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
      }
    }
  });

  return {
    operation: 'cleanup_expired_sessions',
    deleted: result.count
  };
}
