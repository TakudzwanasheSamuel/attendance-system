import { CourseCard } from "@/components/lecturer/course-card";
import { courses, lecturers } from "@/lib/mock-data";
import React from "react";

export default function LecturerDashboardPage() {
  const lecturer = lecturers[0]; // Mock current user
  const lecturerCourses = courses.filter(c => c.lecturerId === lecturer.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome, {lecturer.name}!</h2>
        <p className="text-muted-foreground">Here are the courses you are managing.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {lecturerCourses.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
        {lecturerCourses.length === 0 && (
          <p className="text-muted-foreground col-span-full">You are not assigned to any courses yet.</p>
        )}
      </div>
    </div>
  );
}
