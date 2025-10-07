import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courses, lecturers, students } from "@/lib/mock-data";
import { Book, GraduationCap, UserSquare } from "lucide-react";

export default function AdminDashboardPage() {

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight font-headline">System Overview</h2>
                <p className="text-muted-foreground">A high-level view of the system's data.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            </div>
            
            <div className="text-center text-muted-foreground py-8">
                More administrator tools and reports can be added here.
            </div>
        </div>
    );
}
