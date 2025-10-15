import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const { locationName, latitude, longitude } = await request.json();
    const { courseId } = params;

    // Validate input
    if (!locationName || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Update course location
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        locationName,
        latitude,
        longitude,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Course location updated successfully',
      course: {
        id: updatedCourse.id,
        locationName: updatedCourse.locationName,
        latitude: updatedCourse.latitude,
        longitude: updatedCourse.longitude,
      },
    });

  } catch (error) {
    console.error('Error updating course location:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
