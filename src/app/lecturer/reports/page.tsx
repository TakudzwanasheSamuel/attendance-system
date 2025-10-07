
"use client";

import { ReportGenerator } from "@/components/lecturer/report-generator";
import { courses, lecturers, students } from "@/lib/mock-data";
import { useMemo } from "react";

export default function ReportsPage() {
  const lecturer = lecturers[0]; // Mock current user
  
  const lecturerCourses = useMemo(() => {
    return courses.filter(c => c.lecturerId === lecturer.id);
  }, [lecturer.id]);

  const enrolledStudents = useMemo(() => {
    const studentIds = new Set(lecturerCourses.flatMap(c => c.enrolledStudentIds));
    return students.filter(s => studentIds.has(s.id));
  }, [lecturerCourses]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Generate Attendance Report</h2>
        <p className="text-muted-foreground">
          Use AI to generate a comprehensive summary of attendance data for your courses.
        </p>
      </div>
      <ReportGenerator 
        courses={lecturerCourses}
        students={enrolledStudents}
      />
    </div>
  );
}
