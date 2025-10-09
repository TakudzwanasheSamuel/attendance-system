import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Student } from "@/lib/types";
import { CheckCircle } from "lucide-react";

interface AttendanceTrackerProps {
  attendedStudents: Student[];
}

export function AttendanceTracker({ attendedStudents }: AttendanceTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            <CheckCircle className="text-accent-foreground" />
            Live Attendance
        </CardTitle>
        <CardDescription>
          Students who have marked their attendance for the current session.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {attendedStudents.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} className="text-center h-24">
                            No students have checked in yet.
                        </TableCell>
                    </TableRow>
                )}
                {attendedStudents.map((student) => (
                <TableRow key={student.id}>
                    <TableCell>
                    <div className="flex items-center gap-3">
                        <Avatar>
                        <AvatarFallback>{(student.name || "").trim().split(/\s+/).map(n => n.charAt(0)).slice(0,2).join("").toUpperCase() || "S"}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name}</span>
                    </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
