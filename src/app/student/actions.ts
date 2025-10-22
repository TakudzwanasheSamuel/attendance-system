"use server";

import { validateAttendanceSession, ValidateAttendanceSessionInput } from "@/ai/flows/validate-attendance-session";
import { prisma } from "@/lib/prisma";
import { markAttendance as markAttendanceDB } from "@/lib/database-actions";
import { markAttendanceWithLocation } from "@/lib/geofence-actions";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { type Location } from "@/lib/geofencing";
import { isWithinGeoFence } from "@/lib/geo-utils";
import { detectVPN, shouldBlockAttendance } from "@/lib/vpn-detection";

interface MarkAttendanceInput {
  sessionCode: string;
  latitude?: number;
  longitude?: number;
  userAgent?: string;
}

export async function markAttendance(input: string | MarkAttendanceInput, location?: Location) {
  // Support both old (string) and new (object) input formats
  const sessionCode = typeof input === 'string' ? input : input.sessionCode;
  const latitude = typeof input === 'object' ? input.latitude : undefined;
  const longitude = typeof input === 'object' ? input.longitude : undefined;
  const userAgent = typeof input === 'object' ? input.userAgent : undefined;
  try {
    // Get current user from token
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;
    if (!token) {
      return {
        isValidSession: false,
        isEnrolled: false,
        validationMessage: "Please log in to mark attendance.",
      };
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return {
        isValidSession: false,
        isEnrolled: false,
        validationMessage: "Only students can mark attendance.",
      };
    }

    // Find the active session with the given code
    const session = await prisma.attendancesession.findFirst({
      where: {
        code: sessionCode,
        expiresAt: { gt: new Date() }
      },
      include: {
        course: true,
        geofence: true
      }
    });

    if (!session) {
      return {
        isValidSession: false,
        isEnrolled: false,
        validationMessage: "Invalid or expired session code.",
      };
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseenrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId: session.courseId
        }
      }
    });

    if (!enrollment) {
      return {
        isValidSession: true,
        isEnrolled: false,
        validationMessage: "You are not enrolled in this course.",
      };
    }

    // Check if already marked attendance
    const existingRecord = await prisma.attendancerecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: user.id
        }
      }
    });

    if (existingRecord) {
      return {
        isValidSession: true,
        isEnrolled: true,
        validationMessage: "Attendance already marked for this session.",
      };
    }

    // Geo-fence verification and VPN detection
    let isVerified = true;
    let verificationNotes: string[] = [];
    let distance: number | undefined;

    // VPN Detection
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgentString = userAgent || headersList.get('user-agent') || 'unknown';
    
    const vpnCheck = await detectVPN(ipAddress);
    if (vpnCheck.isVPN && shouldBlockAttendance(vpnCheck)) {
      return {
        isValidSession: true,
        isEnrolled: true,
        validationMessage: "Attendance blocked: VPN detected. Please disable VPN and try again.",
        isBlocked: true,
      };
    }

    // Resolve current coordinates once for reuse below
    const currentLat = typeof latitude === 'number' ? latitude : location?.latitude;
    const currentLng = typeof longitude === 'number' ? longitude : location?.longitude;

    // Location verification (only if session requires it and has a target location)
    if (session.requireLocation && (session.latitude || session.geofenceId)) {
      
      if (!currentLat || !currentLng) {
        return {
          isValidSession: true,
          isEnrolled: true,
          validationMessage: "Location is required for this session. Please enable location services and try again.",
          requiresLocation: true,
        };
      }

      // Use geofence if available, otherwise use session coordinates
      if (session.geofenceId && session.geofence) {
        const geoCheck = isWithinGeoFence(
          { latitude: currentLat, longitude: currentLng },
          {
            centerLatitude: session.geofence.latitude,
            centerLongitude: session.geofence.longitude,
            radiusMeters: session.geofence.radiusMeters || 100,
          }
        );

        distance = geoCheck.distance;

        if (!geoCheck.isWithin) {
          isVerified = false;
          verificationNotes.push(
            `Location verification failed: ${Math.round(geoCheck.distance)}m from venue (max: ${session.geofence.radiusMeters}m)`
          );
        }
      } else if (session.latitude && session.longitude) {
        const geoCheck = isWithinGeoFence(
          { latitude: currentLat, longitude: currentLng },
          {
            centerLatitude: session.latitude,
            centerLongitude: session.longitude,
            radiusMeters: session.radiusMeters || 100,
          }
        );

        distance = geoCheck.distance;

        if (!geoCheck.isWithin) {
          isVerified = false;
          verificationNotes.push(
            `Location verification failed: ${Math.round(geoCheck.distance)}m from venue (max: ${session.radiusMeters}m)`
          );
        }
      }
    }

    // Add VPN check notes to verification if VPN detected but not blocking
    if (vpnCheck.isVPN) {
      verificationNotes.push(
        `VPN/Proxy suspected (${vpnCheck.confidence} confidence): ${vpnCheck.reasons.join(', ')}`
      );
    }

    // Use location-aware attendance marking if any coordinates are available
    if (currentLat !== undefined && currentLng !== undefined) {
      const result = await markAttendanceWithLocation({
        sessionId: session.id,
        userId: user.id,
        status: 'Present',
        latitude: currentLat ?? undefined,
        longitude: currentLng ?? undefined,
        accuracy: location?.accuracy,
        geofenceId: session.geofenceId || undefined,
        isLocationValid: isVerified,
        ipAddress,
        userAgent: userAgentString,
        isVerified,
        verificationNotes: verificationNotes.length > 0 ? verificationNotes.join('; ') : null,
      });

      if (!result.success) {
        return {
          isValidSession: true,
          isEnrolled: true,
          validationMessage: result.error || "Failed to mark attendance.",
        };
      }
    } else {
      // Fallback to regular attendance marking
      await markAttendanceDB({
        sessionId: session.id,
        studentId: user.id,
        status: 'Present'
      });
    }

    return {
      isValidSession: true,
      isEnrolled: true,
      validationMessage: `Attendance successfully marked for ${session.course.name}.`,
      warnings: verificationNotes.length > 0 ? verificationNotes : undefined,
      distance: distance ? Math.round(distance) : undefined,
      requiresVerification: !isVerified,
    };
  } catch (error) {
    console.error("Error in markAttendance action:", error);
    return {
      isValidSession: false,
      isEnrolled: false,
      validationMessage: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function getActiveAttendanceSessions() {
  try {
    // Get current user from token
    const token = cookies().get('auth-token')?.value;
    if (!token) {
      return { success: false, error: "Please log in to view attendance sessions." };
    }

    const user = verifyToken(token);
    if (!user || user.role !== 'STUDENT') {
      return { success: false, error: "Only students can view attendance sessions." };
    }

    // Get all active sessions with geofence information
    const sessions = await prisma.attendancesession.findMany({
      where: {
        expiresAt: { gt: new Date() }
      },
      include: {
        course: {
          include: {
            courseenrollment: {
              where: {
                studentId: user.id
              }
            }
          }
        },
        geofence: true
      },
      orderBy: {
        expiresAt: 'asc'
      }
    });

    // Filter sessions where the student is enrolled
    const enrolledSessions = sessions.filter(session => 
      session.course.courseenrollment.length > 0
    );

    return { 
      success: true, 
      sessions: enrolledSessions.map(session => ({
        id: session.id,
        code: session.code,
        course: {
          name: session.course.name,
          code: session.course.code
        },
        expiresAt: session.expiresAt,
        geofence: session.geofence ? {
          id: session.geofence.id,
          name: session.geofence.name,
          latitude: session.geofence.latitude,
          longitude: session.geofence.longitude,
          radius: session.geofence.radius
        } : undefined,
        requireLocation: session.requireLocation
      }))
    };
  } catch (error) {
    console.error("Error in getActiveAttendanceSessions action:", error);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
