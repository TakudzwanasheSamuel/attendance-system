import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { calculateDistance } from '@/lib/geolocation';

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, email, password, location } = await request.json();

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
        course: true,
        geofence: true
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

    // Location validation (if geofence or course has location set)
    let locationValidated = false;
    let distanceFromLocation = null;
    
    // Check if session has geofence or course has location
    const hasGeofence = session.geofence && session.geofence.isActive;
    const hasCourseLocation = session.course.latitude && session.course.longitude;
    
    if (hasGeofence || hasCourseLocation) {
      if (!location) {
        return NextResponse.json(
          { success: false, error: 'Location is required for this course' },
          { status: 400 }
        );
      }

      // Use geofence location if available, otherwise use course location
      const targetLatitude = hasGeofence ? session.geofence.latitude : session.course.latitude;
      const targetLongitude = hasGeofence ? session.geofence.longitude : session.course.longitude;
      const maxDistance = hasGeofence ? session.geofence.radius : 50; // Default 50m for course location

      distanceFromLocation = calculateDistance(
        location.latitude,
        location.longitude,
        targetLatitude,
        targetLongitude
      );

      // Check if within the allowed distance
      if (distanceFromLocation > maxDistance) {
        const locationType = hasGeofence ? 'geofence' : 'course location';
        return NextResponse.json(
          { 
            success: false, 
            error: `You are ${Math.round(distanceFromLocation)}m away from the ${locationType}. You must be within ${maxDistance}m to mark attendance.` 
          },
          { status: 400 }
        );
      }

      locationValidated = true;
    }

    // Create attendance record
    const attendanceRecord = await prisma.attendancerecord.create({
      data: {
        id: generateId(),
        sessionId: sessionId,
        studentId: student.id,
        status: 'Present',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        accuracy: location?.accuracy || null,
        geofenceId: session.geofenceId || null,
        isLocationValid: locationValidated,
        locationTimestamp: location ? new Date() : null
      }
    });

    console.log('✅ Attendance marked successfully:', attendanceRecord.id);

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
