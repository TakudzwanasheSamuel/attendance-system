import { ReportGenerator } from "@/components/admin/report-generator";
import { prisma } from "@/lib/prisma";

export default async function AdminReportsPage() {
    // Fetch real data from database
    const [courses, lecturers, students] = await Promise.all([
        prisma.course.findMany({
            include: {
                user: true // lecturer info
            }
        }),
        prisma.user.findMany({
            where: { role: 'LECTURER' }
        }),
        prisma.user.findMany({
            where: { role: 'STUDENT' }
        })
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">Generate Attendance Report</h2>
                <p className="text-muted-foreground">
                    Use AI to generate a comprehensive summary of attendance data based on your criteria.
                </p>
            </div>
            <ReportGenerator 
                courses={courses.map(c => ({
                    id: c.id,
                    name: c.name,
                    code: c.code,
                    lecturerId: c.lecturerId,
                    enrolledStudentIds: [] // This will be populated by the report generator if needed
                }))}
                lecturers={lecturers.map(l => ({
                    id: l.id,
                    name: l.name,
                    email: l.email
                }))}
                students={students.map(s => ({
                    id: s.id,
                    name: s.name,
                    email: s.email
                }))}
            />
        </div>
    );
}
