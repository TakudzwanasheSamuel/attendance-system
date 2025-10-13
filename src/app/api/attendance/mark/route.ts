import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { invalidateStudentCache, invalidateSessionCache } from '@/lib/queries';

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, password } = await request.json();

    console.log('🔍 Marking attendance for:', { sessionId, email });

    // Validate input
    if (!sessionId || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the session and verify it's active
    const session = await prisma.attendancesession.findUnique({
      where: { id: sessionId },
      include: {
        course: true
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 404 }
      );
    }

    // Check if session is still active
    if (session.expiresAt <= new Date()) {
      return NextResponse.json(
        { success: false, error: 'Session has expired' },
        { status: 400 }
      );
    }

    // Find the student
    const student = await prisma.user.findUnique({
      where: { email }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, student.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseenrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: session.courseId
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check if student has already marked attendance for this session
    const existingRecord = await prisma.attendancerecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: sessionId,
          studentId: student.id
        }
      }
    });

    if (existingRecord) {
      return NextResponse.json(
        { success: false, error: 'You have already marked attendance for this session' },
        { status: 400 }
      );
    }

    // Create attendance record
    const attendanceRecord = await prisma.attendancerecord.create({
      data: {
        id: generateId(),
        sessionId: sessionId,
        studentId: student.id,
        status: 'Present'
      }
    });

    console.log('✅ Attendance marked successfully:', attendanceRecord.id);

    // Invalidate relevant caches
    invalidateStudentCache(student.id);
    invalidateSessionCache(sessionId);

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      record: {
        id: attendanceRecord.id,
        timestamp: attendanceRecord.timestamp,
        status: attendanceRecord.status
      }
    });

  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
