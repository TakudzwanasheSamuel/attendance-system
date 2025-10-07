import { AttendanceHistoryTable } from "@/components/student/attendance-history-table";
import { getStudentAttendanceHistory, students } from "@/lib/mock-data";
import React from "react";

export default function StudentHistoryPage() {
  const student = students[0]; // Mock current user
  const history = getStudentAttendanceHistory(student.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">My Attendance History</h2>
        <p className="text-muted-foreground">A record of your attendance across all courses.</p>
      </div>
      <AttendanceHistoryTable data={history} />
    </div>
  );
}
