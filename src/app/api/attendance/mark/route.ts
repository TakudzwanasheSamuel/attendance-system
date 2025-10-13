import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { invalidateStudentCache, invalidateSessionCache } from '@/lib/queries';
import { cookies } from 'next/headers';

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userPayload = verifyToken(token);
    
    if (!userPayload || userPayload.role !== 'STUDENT') {
      return NextResponse.json(
        { success: false, error: 'Student access required' },
        { status: 403 }
      );
    }

    const { sessionId, latitude, longitude } = await request.json();

    console.log('🔍 Marking attendance for:', { sessionId, studentId: userPayload.id });

    // Validate input
    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
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

    // Get the authenticated student
    const student = await prisma.user.findUnique({
      where: { id: userPayload.id }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
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
    const attendanceData: any = {
      id: generateId(),
      sessionId: sessionId,
      studentId: student.id,
      status: 'Present'
    };

    // Add location data if provided
    if (latitude && longitude) {
      attendanceData.latitude = latitude;
      attendanceData.longitude = longitude;
    }

    const attendanceRecord = await prisma.attendancerecord.create({
      data: attendanceData
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
