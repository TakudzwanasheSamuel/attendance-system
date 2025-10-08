import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
    attendanceRecords: any[];
    attendanceSessions: any[];
    students: any[];
    courses: any[];
    lecturers: any[];
}

export function RecentActivity({ attendanceRecords, attendanceSessions, students, courses, lecturers }: RecentActivityProps) {
    const userAvatar = PlaceHolderImages.find(p => p.id === "avatar-1");

    // Combine different types of activities and sort them by date
    const activities = [
        ...attendanceRecords.map(r => ({ type: 'attendance' as const, data: r, date: new Date((r as any)?.timestamp) })),
        ...attendanceSessions.map(s => ({ type: 'session' as const, data: s, date: new Date((s as any)?.createdAt) })),
    ]
      .filter(a => a.date instanceof Date && !isNaN(a.date.getTime()))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5); // Get latest 5 activities

    const renderActivity = (activity: (typeof activities)[number]) => {
        if (activity.type === 'attendance') {
            const record = activity.data as any;
            const studentName = record?.user?.name ?? 'A student';
            const courseId = record?.attendancesession?.courseId;
            const course = courses.find(c => c.id === courseId);
            return (
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{studentName}</span> marked attendance for <span className="font-semibold text-foreground">{course?.name || 'a course'}</span>.
                </p>
            );
        }
        if (activity.type === 'session') {
            const session = activity.data as any;
            const course = courses.find(c => c.id === session?.courseId);
            const lecturer = lecturers.find(l => l.id === course?.lecturerId);
            return (
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{lecturer?.name || 'A lecturer'}</span> created a new session for <span className="font-semibold text-foreground">{course?.name || 'a course'}</span>.
                </p>
            );
        }
        return null;
    }

  return (
    <div className="space-y-8">
      {activities.map((activity, index) => (
         <div key={index} className="flex items-center">
            <Avatar className="h-9 w-9">
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="Avatar" />}
            <AvatarFallback>
                {activity.type === 'attendance' && 'SA'}
                {activity.type === 'session' && 'LS'}
                {activity.type === 'newUser' && 'NU'}
            </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
                {renderActivity(activity)}
                <p className="text-xs text-muted-foreground">
                    {formatDistanceToNow(activity.date, { addSuffix: true })}
                </p>
            </div>
      </div>
      ))}
    </div>
  );
}
