"use server";

import { validateAttendanceSession, ValidateAttendanceSessionInput } from "@/ai/flows/validate-attendance-session";
import { prisma } from "@/lib/prisma";
import { markAttendance as markAttendanceDB } from "@/lib/database-actions";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function markAttendance(sessionCode: string) {
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
    const session = await prisma.attendanceSession.findFirst({
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

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findUnique({
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
    const existingRecord = await prisma.attendanceRecord.findUnique({
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

    // Mark attendance
    await markAttendanceDB({
      sessionId: session.id,
      studentId: user.id,
      status: 'Present'
    });

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
