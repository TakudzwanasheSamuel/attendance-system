import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { attendanceRecords, students, courses, lecturers, attendanceSessions } from "@/lib/mock-data";
import { formatDistanceToNow } from "date-fns";

export function RecentActivity() {
    const userAvatar = PlaceHolderImages.find(p => p.id === "avatar-1");

    // Combine different types of activities and sort them by date
    const activities = [
        ...attendanceRecords.map(r => ({ type: 'attendance', data: r, date: r.timestamp })),
        ...attendanceSessions.map(s => ({ type: 'session', data: s, date: s.createdAt })),
        ...students.slice(0, 2).map(s => ({ type: 'newUser', data: s, date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24) })) // Mock new users
    ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5); // Get latest 5 activities

    const renderActivity = (activity: (typeof activities)[0]) => {
        const student = students.find(s => s.id === (activity.data as any).studentId);
        const course = courses.find(c => c.id === (activity.data as any).courseId);
        const lecturer = lecturers.find(l => l.id === course?.lecturerId);

        switch (activity.type) {
            case 'attendance':
                return (
                     <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{student?.name || 'A student'}</span> marked attendance for <span className="font-semibold text-foreground">{course?.name || 'a course'}</span>.
                    </p>
                );
            case 'session':
                 return (
                     <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{lecturer?.name || 'A lecturer'}</span> created a new session for <span className="font-semibold text-foreground">{course?.name || 'a course'}</span>.
                    </p>
                );
            case 'newUser':
                return (
                     <p className="text-sm text-muted-foreground">
                        New user <span className="font-semibold text-foreground">{(activity.data as any).name}</span> signed up as a Student.
                    </p>
                );
            default:
                return null;
        }
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
