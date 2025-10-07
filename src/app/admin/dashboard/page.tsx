import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { courses, lecturers, students, getCourseAttendanceReport, attendanceSessions } from "@/lib/mock-data";
import { Book, GraduationCap, UserSquare, History, CheckCircle } from "lucide-react";
import { AggregateAttendanceChart } from "@/components/admin/aggregate-attendance-chart";
import { RecentActivity } from "@/components/admin/recent-activity";

export default function AdminDashboardPage() {
    
    // Create aggregate data for the chart
    const allReports = courses.flatMap(course => getCourseAttendanceReport(course.id));
    const studentsWithAttendance = allReports.reduce((acc, report) => {
        if (!acc[report.name]) {
            acc[report.name] = { attended: 0, total: 0 };
        }
        acc[report.name].attended += report.attended;
        acc[report.name].total += report.total;
        return acc;
    }, {} as Record<string, { attended: number; total: number }>);

    const aggregateChartData = Object.entries(studentsWithAttendance).map(([name, data]) => ({
        name,
        percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0
    })).slice(0, 10); // Limit for display

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">System Overview</h2>
                <p className="text-muted-foreground">A high-level view of the system's data and activity.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{students.length}</div>
                        <p className="text-xs text-muted-foreground">Registered students</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Lecturers</CardTitle>
                        <UserSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lecturers.length}</div>
                        <p className="text-xs text-muted-foreground">Registered lecturers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
                        <Book className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{courses.length}</div>
                        <p className="text-xs text-muted-foreground">Courses offered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{attendanceSessions.length}</div>
                        <p className="text-xs text-muted-foreground">Attendance sessions created</p>
                    </CardContent>
                </Card>
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="font-headline">Overall Student Attendance</CardTitle>
                        <CardDescription>Average attendance percentage across all courses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AggregateAttendanceChart data={aggregateChartData} />
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-2">
                    <CardHeader>
                         <CardTitle className="font-headline flex items-center gap-2">
                            <History />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>A log of recent system events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
