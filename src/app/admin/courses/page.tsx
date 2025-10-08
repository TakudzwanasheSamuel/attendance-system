import { CourseTable } from "@/components/admin/course-table";
import { AddCourseDialog } from "@/components/admin/add-course-dialog";
import { getAllCourses } from "@/lib/database-actions";

export default async function CourseManagementPage() {
    try {
        const courses = await getAllCourses();
        
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Course Management</h2>
                        <p className="text-muted-foreground">Create, view, and manage all courses in the system.</p>
                    </div>
                    <AddCourseDialog />
                </div>
                <CourseTable courses={courses || []} />
            </div>
        );
    } catch (error) {
        console.error('Error fetching courses:', error);
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight font-headline">Course Management</h2>
                        <p className="text-muted-foreground">Create, view, and manage all courses in the system.</p>
                    </div>
                    <AddCourseDialog />
                </div>
                <div className="text-center py-8">
                    <p className="text-muted-foreground">Error loading courses. Please try again.</p>
                </div>
            </div>
        );
    }
}
