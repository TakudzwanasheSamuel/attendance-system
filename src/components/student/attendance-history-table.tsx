"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { format } from 'date-fns';

interface HistoryData {
  courseName: string;
  date: Date;
  status: 'Present' | 'Absent';
}

interface AttendanceHistoryTableProps {
  data: HistoryData[];
}

export function AttendanceHistoryTable({ data }: AttendanceHistoryTableProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Attendance Log</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="border rounded-md">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center">No attendance records found.</TableCell>
                        </TableRow>
                    )}
                    {data.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{item.courseName}</TableCell>
                        <TableCell>{format(item.date, 'PPP')}</TableCell>
                        <TableCell>{format(item.date, 'p')}</TableCell>
                        <TableCell className="text-right">
                        <Badge variant={item.status === 'Present' ? 'default' : 'destructive'} 
                                className={item.status === 'Present' ? 'bg-accent text-accent-foreground' : ''}>
                            {item.status}
                        </Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
  );
}
