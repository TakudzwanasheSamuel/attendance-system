import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Book, GraduationCap, UserSquare, History, CheckCircle } from "lucide-react";
import { AggregateAttendanceChart } from "@/components/admin/aggregate-attendance-chart";
import { RecentActivity } from "@/components/admin/recent-activity";
import { LecturersCoursesList } from "@/components/admin/lecturers-courses-list";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
    // Fetch real data from database
    const [students, lecturers, courses, attendanceSessions, attendanceRecords, lecturersWithCourses] = await Promise.all([
        prisma.user.findMany({ where: { role: 'STUDENT' } }),
        prisma.user.findMany({ where: { role: 'LECTURER' } }),
        prisma.course.findMany(),
        prisma.attendancesession.findMany(),
        prisma.attendancerecord.findMany({
            include: {
                user: true,
                attendancesession: {
                    include: {
                        course: true
                    }
                }
            }
        }),
        prisma.user.findMany({
            where: { role: 'LECTURER' },
            include: {
                course: {
                    select: {
                        id: true,
                        name: true,
                        code: true
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })
    ]);

    // Create aggregate data for the chart
    const studentsWithAttendance = attendanceRecords.reduce((acc, record) => {
        const studentName = record.user.name;
        if (!acc[studentName]) {
            acc[studentName] = { attended: 0, total: 0 };
        }
        acc[studentName].attended += record.status === 'Present' ? 1 : 0;
        acc[studentName].total += 1;
        return acc;
    }, {} as Record<string, { attended: number; total: number }>);

    const aggregateChartData = Object.entries(studentsWithAttendance).map(([name, data]) => ({
        name,
        percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0
    })).slice(0, 10); // Limit for display

    // Transform lecturers data to match component interface
    const lecturersData = lecturersWithCourses.map(lecturer => ({
        id: lecturer.id,
        name: lecturer.name,
        email: lecturer.email,
        courses: lecturer.course
    }));

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

                <Card className="col-span-1">
                    <CardHeader>
                         <CardTitle className="font-headline flex items-center gap-2">
                            <History />
                            Recent Activity
                        </CardTitle>
                        <CardDescription>A log of recent system events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RecentActivity 
                            attendanceRecords={attendanceRecords}
                            attendanceSessions={attendanceSessions}
                            students={students}
                            courses={courses}
                            lecturers={lecturers}
                        />
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                         <CardTitle className="font-headline flex items-center gap-2">
                            <UserSquare />
                            Lecturers & Courses
                        </CardTitle>
                        <CardDescription>View lecturers and their assigned courses.</CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto">
                        <LecturersCoursesList lecturers={lecturersData} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
