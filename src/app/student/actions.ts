"use server";

import { validateAttendanceSession, ValidateAttendanceSessionInput } from "@/ai/flows/validate-attendance-session";
import { prisma } from "@/lib/prisma";
import { markAttendance as markAttendanceDB } from "@/lib/database-actions";
import { markAttendanceWithLocation } from "@/lib/geofence-actions";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { type Location } from "@/lib/geofencing";

export async function markAttendance(sessionCode: string, location?: Location) {
  try {
    // Get current user from token
    const token = cookies().get('auth-token')?.value;
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

    // Use location-aware attendance marking if location is provided
    if (location) {
      const result = await markAttendanceWithLocation({
        sessionId: session.id,
        userId: user.id,
        status: 'Present',
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        geofenceId: session.geofenceId || undefined,
        isLocationValid: session.geofence ? 
          (location.latitude && location.longitude ? true : false) : true
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
