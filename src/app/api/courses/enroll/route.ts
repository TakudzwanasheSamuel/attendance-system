import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { invalidateStudentCache, invalidateCourseCache } from '@/lib/queries';

export async function POST(request: NextRequest) {
  try {
    console.log('🎓 Course enrollment request received');
    
    // Get the current user from the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    console.log('🔍 Token exists:', !!token);
    
    if (!token) {
      console.log('❌ No token found');
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify the token and get user info
    const userPayload = verifyToken(token);
    
    console.log('🔍 User payload:', userPayload ? { id: userPayload.id, role: userPayload.role } : 'null');
    
    if (!userPayload || userPayload.role !== 'STUDENT') {
      console.log('❌ Invalid token or not a student');
      return NextResponse.json({ error: 'Access denied. Students only.' }, { status: 403 });
    }

    const { courseId, studentId } = await request.json();
    
    console.log('📝 Enrollment data:', { courseId, studentId, authenticatedUserId: userPayload.id });

    // Validate input
    if (!courseId || !studentId) {
      return NextResponse.json({ error: 'Course ID and Student ID are required' }, { status: 400 });
    }

    // Verify that the authenticated user matches the studentId
    if (userPayload.id !== studentId) {
      return NextResponse.json({ error: 'You can only enroll yourself' }, { status: 403 });
    }

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });
    
    console.log('📚 Course lookup result:', course ? { id: course.id, name: course.name, lecturer: course.user.name } : 'Course not found');

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if the student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId },
      select: {
        id: true,
        name: true,
        role: true
      }
    });

    console.log('👨‍🎓 Student lookup result:', student ? { id: student.id, name: student.name, role: student.role } : 'Student not found');

    if (!student || student.role !== 'STUDENT') {
      console.log('❌ Student not found or not a student');
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseenrollment.findFirst({
      where: {
        studentId: studentId,
        courseId: courseId
      }
    });

    console.log('🔍 Existing enrollment check:', existingEnrollment ? 'Already enrolled' : 'Not enrolled');

    if (existingEnrollment) {
      console.log('❌ Student already enrolled');
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }

    // Create the enrollment
    console.log('🔄 Creating enrollment...');
    
    const enrollment = await prisma.courseenrollment.create({
      data: {
        studentId,
        courseId,
        createdAt: new Date()
      },
      include: {
        course: {
          select: {
            name: true,
            code: true
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    console.log(`✅ Student ${student.name} enrolled in ${course.name} (${course.code})`);
    console.log('📝 Enrollment details:', {
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      createdAt: enrollment.createdAt
    });

    // Invalidate relevant caches
    console.log('🗑️ Invalidating caches...');
    invalidateStudentCache(studentId);
    invalidateCourseCache(courseId);

    return NextResponse.json({
      success: true,
      message: `Successfully enrolled in ${course.name}`,
      enrollment: {
        courseId: enrollment.courseId,
        courseName: enrollment.course.name,
        courseCode: enrollment.course.code,
        studentName: enrollment.user.name,
        enrolledAt: enrollment.createdAt
      }
    });

  } catch (error) {
    console.error('Course enrollment error:', error);
    
    // Handle Prisma unique constraint errors
    if (error instanceof Error && error.message.includes('P2002')) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }
    
    return NextResponse.json({ 
      error: 'An error occurred while enrolling in the course' 
    }, { status: 500 });
  }
}
