import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
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
    
    if (!userPayload || userPayload.role !== 'LECTURER') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const { courseId, duration = 15, geofenceId } = await request.json();

    console.log('🔍 Creating session for course:', courseId, 'by lecturer:', userPayload.id);

    // Verify the lecturer owns this course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        lecturerId: userPayload.id
      }
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found or access denied' },
        { status: 404 }
      );
    }

    // Check if there's already an active session for this course
    const existingSession = await prisma.attendancesession.findFirst({
      where: {
        courseId: courseId,
        expiresAt: {
          gt: new Date() // Still active
        }
      }
    });

    if (existingSession) {
      return NextResponse.json(
        { success: false, error: 'There is already an active session for this course' },
        { status: 400 }
      );
    }

    // Generate a unique session code
    const sessionCode = generateSessionCode();
    
    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + duration);

    // Verify geofence exists if provided
    if (geofenceId) {
      const geofence = await prisma.geofence.findUnique({
        where: { id: geofenceId }
      });
      
      if (!geofence || !geofence.isActive) {
        return NextResponse.json(
          { success: false, error: 'Invalid or inactive geofence' },
          { status: 400 }
        );
      }
    }

    // Create the session
    const session = await prisma.attendancesession.create({
      data: {
        id: generateId(), // Add the missing id field
        courseId: courseId,
        code: sessionCode,
        expiresAt: expiresAt,
        geofenceId: geofenceId || null,
        requireLocation: !!geofenceId
      }
    });

    console.log('✅ Session created successfully:', session.id);

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        code: session.code,
        expiresAt: session.expiresAt,
        courseId: session.courseId
      }
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateId(): string {
  // Generate a unique ID similar to the seed script
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function generateSessionCode(): string {
  // Generate a 6-character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
