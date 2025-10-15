"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, CheckCircle } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  timestamp: Date;
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface LiveAttendanceProps {
  sessionId: string;
  className?: string;
}

export function LiveAttendance({ sessionId, className = "" }: LiveAttendanceProps) {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceRecords = async () => {
    try {
      const response = await fetch(`/api/attendance/records/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch attendance records');
      }
      
      const data = await response.json();
      if (data.success) {
        setAttendanceRecords(data.records);
      } else {
        setError(data.error || 'Failed to fetch attendance records');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRecords();
    
    // Refresh every 5 seconds to show live updates
    const interval = setInterval(fetchAttendanceRecords, 5000);
    
    return () => clearInterval(interval);
  }, [sessionId]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'present':
        return <Badge variant="default" className="bg-green-500">Present</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-500">Late</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Attendance
          </CardTitle>
          <CardDescription>Loading attendance records...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Attendance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Live Attendance
        </CardTitle>
        <CardDescription>
          Students who have marked attendance ({attendanceRecords.length} present)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {attendanceRecords.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No attendance records yet</p>
            <p className="text-sm text-muted-foreground">Students will appear here as they mark attendance</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {attendanceRecords
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{record.user.name}</p>
                      {getStatusBadge(record.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{record.user.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(record.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(record.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
