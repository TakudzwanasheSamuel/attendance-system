import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
    attendanceRecords: any[];
    attendanceSessions: any[];
    students: any[];
    courses: any[];
    lecturers: any[];
}

export function RecentActivity({ attendanceRecords, attendanceSessions, students, courses, lecturers }: RecentActivityProps) {
    // Only show activities from the last 24 hours to avoid showing old seeded data
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Filter attendance records to only recent ones
    const recentAttendanceRecords = attendanceRecords.filter(r => {
        const recordDate = new Date((r as any)?.timestamp);
        return recordDate >= twentyFourHoursAgo;
    });

    // Filter sessions to only recent ones
    const recentSessions = attendanceSessions.filter(s => {
        const sessionDate = new Date((s as any)?.createdAt);
        return sessionDate >= twentyFourHoursAgo;
    });

    // Combine different types of activities and sort them by date
    const activities = [
        ...recentAttendanceRecords.map(r => ({ type: 'attendance' as const, data: r, date: new Date((r as any)?.timestamp) })),
        ...recentSessions.map(s => ({ type: 'session' as const, data: s, date: new Date((s as any)?.createdAt) })),
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
      {activities.length > 0 ? (
        activities.map((activity, index) => (
           <div key={index} className="flex items-center">
              <Avatar className="h-9 w-9">
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
        ))
      ) : (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No recent activity in the last 24 hours.</p>
          <p className="text-xs text-muted-foreground mt-1">Activity will appear here when students mark attendance or lecturers create sessions.</p>
        </div>
      )}
    </div>
  );
}
