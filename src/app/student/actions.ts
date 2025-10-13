"use server";

import { validateAttendanceSession, ValidateAttendanceSessionInput } from "@/ai/flows/validate-attendance-session";
import { prisma } from "@/lib/prisma";
import { markAttendance as markAttendanceDB } from "@/lib/database-actions";
import { cookies, headers } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { isWithinGeoFence } from "@/lib/geo-utils";
import { detectVPN, shouldBlockAttendance } from "@/lib/vpn-detection";

interface MarkAttendanceInput {
  sessionCode: string;
  latitude?: number;
  longitude?: number;
  userAgent?: string;
}

export async function markAttendance(input: string | MarkAttendanceInput) {
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
        course: true
      }
    });

    if (!session) {
      return {
        isValidSession: false,
        isEnrolled: false,
        validationMessage: "Invalid or expired session code.",
      };
    }

    // Check if session has started (if startDelay was set)
    const now = new Date();
    if (session.startsAt && session.startsAt > now) {
      const minutesUntilStart = Math.ceil((session.startsAt.getTime() - now.getTime()) / 60000);
      return {
        isValidSession: true,
        isEnrolled: false,
        validationMessage: `This session hasn't started yet. Please wait ${minutesUntilStart} minute${minutesUntilStart !== 1 ? 's' : ''} before recording attendance.`,
        sessionNotStarted: true,
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

    // Geo-fence verification
    let isVerified = true;
    let verificationNotes: string[] = [];
    let distance: number | undefined;

    if (session.requireLocation && session.latitude && session.longitude) {
      if (!latitude || !longitude) {
        return {
          isValidSession: true,
          isEnrolled: true,
          validationMessage: "Location is required for this session. Please enable location services and try again.",
          requiresLocation: true,
        };
      }

      const geoCheck = isWithinGeoFence(
        { latitude, longitude },
        {
          centerLatitude: session.latitude,
          centerLongitude: session.longitude,
          radiusMeters: session.radiusMeters || 50,
        }
      );

      distance = geoCheck.distance;

      if (!geoCheck.isWithin) {
        // Block attendance if outside the geofence
        return {
          isValidSession: true,
          isEnrolled: true,
          validationMessage: `You are too far from the session location. You are ${Math.round(geoCheck.distance)}m away (maximum allowed: ${session.radiusMeters || 50}m). Please move closer to record attendance.`,
          locationBlocked: true,
          distance: Math.round(geoCheck.distance),
        };
      }
    }

    // Get IP address
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                      headersList.get('x-real-ip') || 
                      'unknown';

    // VPN Detection
    const vpnDetection = await detectVPN(ipAddress, userAgent);
    
    // Check if VPN should block attendance (strict mode enabled)
    if (shouldBlockAttendance(vpnDetection, true)) {
      return {
        isValidSession: true,
        isEnrolled: true,
        validationMessage: "VPN or proxy detected. Please disable your VPN and try again.",
        vpnDetected: true,
        vpnDetails: {
          confidence: vpnDetection.confidence,
          reasons: vpnDetection.reasons,
        },
      };
    }

    // Add VPN check notes to verification if VPN detected but not blocking
    if (vpnDetection.isVPN) {
      verificationNotes.push(
        `VPN/Proxy suspected (${vpnDetection.confidence} confidence): ${vpnDetection.reasons.join(', ')}`
      );
    }

    // Generate unique ID
    const id =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Mark attendance with verification data
    await prisma.attendancerecord.create({
      data: {
        id,
        sessionId: session.id,
        studentId: user.id,
        status: 'Present',
        latitude,
        longitude,
        ipAddress,
        userAgent,
        isVerified,
        verificationNotes: verificationNotes.length > 0 ? verificationNotes.join('; ') : null,
      },
    });

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
