import { AttendanceForm } from "@/components/student/attendance-form";
import { students } from "@/lib/mock-data";
import React from "react";

export default function StudentDashboardPage() {
  const student = students[0]; // Mock current user

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">Welcome, {student.name.split(' ')[0]}!</h2>
        <p className="text-muted-foreground">Ready to mark your attendance? Enter the session code below.</p>
      </div>
      <AttendanceForm />
    </div>
  );
}
