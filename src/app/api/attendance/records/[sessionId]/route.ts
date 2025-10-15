import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    // Get the current user from the auth token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify the token and get user info
    const userPayload = verifyToken(token);
    
    if (!userPayload || (userPayload.role !== 'LECTURER' && userPayload.role !== 'ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get the session to verify it exists and get course info
    const session = await prisma.attendancesession.findUnique({
      where: { id: sessionId },
      include: {
        course: true
      }
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // For lecturers, verify they own the course
    if (userPayload.role === 'LECTURER' && session.course.lecturerId !== userPayload.id) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get attendance records for this session
    const records = await prisma.attendancerecord.findMany({
      where: { sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      records: records.map(record => ({
        id: record.id,
        timestamp: record.timestamp,
        status: record.status,
        user: record.user
      }))
    });

  } catch (error) {
    console.error('Error fetching attendance records:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
