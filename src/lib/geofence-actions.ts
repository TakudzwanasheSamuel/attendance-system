"use server";

import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

export interface GeofenceData {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

export async function createGeofence(data: GeofenceData) {
  try {
    const geofence = await prisma.geofence.create({
      data: {
        id: `geofence-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        description: data.description,
        latitude: data.latitude,
        longitude: data.longitude,
        radius: data.radius,
        isActive: data.isActive,
      },
    });

    revalidatePath('/admin/geofences');
    return { success: true, geofence };
  } catch (error) {
    console.error('Error creating geofence:', error);
    return { success: false, error: 'Failed to create geofence' };
  }
}

export async function updateGeofence(id: string, data: Partial<GeofenceData>) {
  try {
    const geofence = await prisma.geofence.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    revalidatePath('/admin/geofences');
    return { success: true, geofence };
  } catch (error) {
    console.error('Error updating geofence:', error);
    return { success: false, error: 'Failed to update geofence' };
  }
}

export async function deleteGeofence(id: string) {
  try {
    // Check if geofence is being used by any attendance sessions
    const activeSessions = await prisma.attendancesession.count({
      where: { geofenceId: id }
    });

    if (activeSessions > 0) {
      return { 
        success: false, 
        error: 'Cannot delete geofence that is being used by active attendance sessions' 
      };
    }

    await prisma.geofence.delete({
      where: { id },
    });

    revalidatePath('/admin/geofences');
    return { success: true };
  } catch (error) {
    console.error('Error deleting geofence:', error);
    return { success: false, error: 'Failed to delete geofence' };
  }
}

export async function getAllGeofences() {
  try {
    const geofences = await prisma.geofence.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, geofences };
  } catch (error) {
    console.error('Error fetching geofences:', error);
    return { success: false, error: 'Failed to fetch geofences' };
  }
}

export async function getActiveGeofences() {
  try {
    const geofences = await prisma.geofence.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    return { success: true, geofences };
  } catch (error) {
    console.error('Error fetching active geofences:', error);
    return { success: false, error: 'Failed to fetch active geofences' };
  }
}

export async function getGeofenceById(id: string) {
  try {
    const geofence = await prisma.geofence.findUnique({
      where: { id },
    });

    if (!geofence) {
      return { success: false, error: 'Geofence not found' };
    }

    return { success: true, geofence };
  } catch (error) {
    console.error('Error fetching geofence:', error);
    return { success: false, error: 'Failed to fetch geofence' };
  }
}

export async function createAttendanceSessionWithGeofence(data: {
  courseId: string;
  code: string;
  expiresAt: Date;
  geofenceId?: string;
  requireLocation?: boolean;
}) {
  try {
    const session = await prisma.attendancesession.create({
      data: {
        id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        courseId: data.courseId,
        code: data.code,
        expiresAt: data.expiresAt,
        geofenceId: data.geofenceId,
        requireLocation: data.requireLocation || false,
      },
      include: {
        geofence: true,
        course: true,
      },
    });

    revalidatePath('/lecturer/courses');
    return { success: true, session };
  } catch (error) {
    console.error('Error creating attendance session with geofence:', error);
    return { success: false, error: 'Failed to create attendance session' };
  }
}

export async function markAttendanceWithLocation(data: {
  sessionId: string;
  userId: string;
  status: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  geofenceId?: string;
  isLocationValid?: boolean;
}) {
  try {
    // Check if session exists and is still active
    const session = await prisma.attendancesession.findUnique({
      where: { id: data.sessionId },
      include: { geofence: true },
    });

    if (!session) {
      return { success: false, error: 'Attendance session not found' };
    }

    if (new Date() > session.expiresAt) {
      return { success: false, error: 'Attendance session has expired' };
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.courseenrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: data.userId,
          courseId: session.courseId,
        },
      },
    });

    if (!enrollment) {
      return { success: false, error: 'You are not enrolled in this course' };
    }

    // Check if attendance already exists
    const existingAttendance = await prisma.attendancerecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: data.sessionId,
          studentId: data.userId,
        },
      },
    });

    if (existingAttendance) {
      return { success: false, error: 'Attendance already marked for this session' };
    }

    // Create attendance record
    const attendanceRecord = await prisma.attendancerecord.create({
      data: {
        id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        sessionId: data.sessionId,
        studentId: data.userId,
        status: data.status,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        geofenceId: data.geofenceId,
        isLocationValid: data.isLocationValid || false,
        locationTimestamp: data.latitude && data.longitude ? new Date() : null,
      },
      include: {
        user: true,
        attendancesession: {
          include: {
            course: true,
            geofence: true,
          },
        },
      },
    });

    revalidatePath('/student/dashboard');
    revalidatePath('/lecturer/courses');
    return { success: true, attendanceRecord };
  } catch (error) {
    console.error('Error marking attendance with location:', error);
    return { success: false, error: 'Failed to mark attendance' };
  }
}

export async function getAttendanceRecordsWithLocation(sessionId: string) {
  try {
    const records = await prisma.attendancerecord.findMany({
      where: { sessionId },
      include: {
        user: true,
        geofence: true,
      },
      orderBy: { timestamp: 'desc' },
    });

    return { success: true, records };
  } catch (error) {
    console.error('Error fetching attendance records with location:', error);
    return { success: false, error: 'Failed to fetch attendance records' };
  }
}

export async function getLocationStatistics() {
  try {
    const totalRecords = await prisma.attendancerecord.count();
    const locationValidRecords = await prisma.attendancerecord.count({
      where: { isLocationValid: true },
    });
    const locationInvalidRecords = await prisma.attendancerecord.count({
      where: { isLocationValid: false },
    });
    const noLocationRecords = await prisma.attendancerecord.count({
      where: { latitude: null },
    });

    return {
      success: true,
      statistics: {
        total: totalRecords,
        locationValid: locationValidRecords,
        locationInvalid: locationInvalidRecords,
        noLocation: noLocationRecords,
        locationValidPercentage: totalRecords > 0 ? (locationValidRecords / totalRecords) * 100 : 0,
      },
    };
  } catch (error) {
    console.error('Error fetching location statistics:', error);
    return { success: false, error: 'Failed to fetch location statistics' };
  }
}


