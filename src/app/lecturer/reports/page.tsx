
"use client";

import { AttendanceReportChart } from "@/components/lecturer/attendance-report-chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCourseAttendanceReport, courses, lecturers } from "@/lib/mock-data";
import { useRouter, useSearchParams } from "next/navigation";
import React from "react";

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lecturer = lecturers[0]; // Mock current user
  const lecturerCourses = courses.filter(c => c.lecturerId === lecturer.id);
  const selectedCourseId = searchParams.get('course') || lecturerCourses[0]?.id;
  const reportData = getCourseAttendanceReport(selectedCourseId);

  const handleCourseChange = (courseId: string) => {
    router.push(`/lecturer/reports?course=${courseId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Attendance Reports</h2>
          <p className="text-muted-foreground">
            Visualize student attendance percentages for your courses.
          </p>
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedCourseId} onValueChange={handleCourseChange}>
            <SelectTrigger id="course-select">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {lecturerCourses.map(course => (
                 <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <AttendanceReportChart data={reportData} />
    </div>
  );
}
