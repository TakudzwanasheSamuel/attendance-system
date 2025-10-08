import { CourseCard } from "@/components/lecturer/course-card";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import React from "react";

export default async function LecturerDashboardPage() {
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to access the lecturer dashboard.</p>
        </div>
      </div>
    );
  }

  // Verify the token and get user info
  const userPayload = verifyToken(token);
  
  if (!userPayload || userPayload.role !== 'LECTURER') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Access Denied</h2>
          <p className="text-muted-foreground">This page is only accessible to lecturers.</p>
        </div>
      </div>
    );
  }

  console.log('🔍 Loading lecturer dashboard for user:', userPayload);
  
  // Get the current lecturer from database
  const lecturer = await prisma.user.findUnique({
    where: { id: userPayload.id }
  });

  if (!lecturer) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Lecturer Not Found</h2>
          <p className="text-muted-foreground">The lecturer account could not be found.</p>
        </div>
      </div>
    );
  }

  // Get lecturer's courses with enrollment data
  const lecturerCourses = await prisma.course.findMany({
    where: { lecturerId: userPayload.id },
    include: {
      courseenrollment: {
        include: {
          user: true // student info
        }
      },
      attendancesession: {
        orderBy: { createdAt: 'desc' },
        take: 1 // Get the most recent session
      }
    }
  });

  console.log(`📊 Lecturer ${lecturer.name} has ${lecturerCourses.length} courses`);

  // Transform data for the CourseCard component
  const coursesForDisplay = lecturerCourses.map(course => ({
    id: course.id,
    name: course.name,
    code: course.code,
    lecturerId: course.lecturerId,
    enrolledStudentIds: course.courseenrollment.map(enrollment => enrollment.studentId),
    // Add additional data for enhanced display
    enrolledStudents: course.courseenrollment.length,
    lastSession: course.attendancesession[0] ? {
      id: course.attendancesession[0].id,
      code: course.attendancesession[0].code,
      createdAt: course.attendancesession[0].createdAt,
      expiresAt: course.attendancesession[0].expiresAt
    } : null
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome, {lecturer.name}!</h2>
        <p className="text-muted-foreground">Here are the courses you are managing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {coursesForDisplay.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
        {coursesForDisplay.length === 0 && (
          <p className="text-muted-foreground col-span-full">You are not assigned to any courses yet.</p>
        )}
      </div>
    </div>
  );
}
