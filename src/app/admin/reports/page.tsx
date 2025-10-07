import { ReportGenerator } from "@/components/admin/report-generator";
import { courses, lecturers, students, attendanceRecords, attendanceSessions } from "@/lib/mock-data";

export default function AdminReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Generate Attendance Report</h2>
                <p className="text-muted-foreground">
                    Use AI to generate a comprehensive summary of attendance data based on your criteria.
                </p>
            </div>
            <ReportGenerator 
                courses={courses}
                lecturers={lecturers}
                students={students}
            />
        </div>
    );
}
