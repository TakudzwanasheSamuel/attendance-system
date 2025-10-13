"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Wifi, WifiOff } from "lucide-react";
import { ExportButton } from "@/components/shared/export-button";

interface AttendanceRecord {
  id: string;
  studentName: string;
  studentEmail: string;
  timestamp: string;
  status: string;
}

interface LiveAttendanceData {
  sessionId: string;
  count: number;
  records: AttendanceRecord[];
  lastUpdate: string;
}

interface LiveAttendanceProps {
  sessionId: string;
  initialData?: LiveAttendanceData;
}

export function LiveAttendance({ sessionId, initialData }: LiveAttendanceProps) {
  const [data, setData] = useState<LiveAttendanceData | null>(initialData || null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`/api/sessions/${sessionId}/live`);
        
        eventSource.onopen = () => {
          setIsConnected(true);
          setError(null);
          console.log('✅ Live attendance connected');
        };

        eventSource.onmessage = (event) => {
          try {
            const newData: LiveAttendanceData = JSON.parse(event.data);
            setData(newData);
          } catch (err) {
            console.error('Failed to parse SSE data:', err);
          }
        };

        eventSource.onerror = (err) => {
          console.error('SSE Error:', err);
          setIsConnected(false);
          setError('Connection lost. Attempting to reconnect...');
          
          // Attempt to reconnect after 5 seconds
          setTimeout(() => {
            if (eventSource?.readyState === EventSource.CLOSED) {
              connectSSE();
            }
          }, 5000);
        };

      } catch (err) {
        console.error('Failed to create EventSource:', err);
        setError('Failed to establish live connection');
      }
    };

    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [sessionId]);

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Attendance
          </CardTitle>
          <CardDescription>Loading live attendance data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Connecting to live updates...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Live Attendance
          </div>
          <div className="flex items-center gap-2">
            <ExportButton sessionId={sessionId} className="h-8" />
            {isConnected ? (
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Wifi className="h-3 w-3 mr-1" />
                Live
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-600">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </Badge>
            )}
            <Badge variant="secondary">
              {data.count} Present
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Real-time attendance tracking
          {data.lastUpdate && (
            <span className="ml-2 text-xs">
              Last update: {new Date(data.lastUpdate).toLocaleTimeString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
        
        {data.records.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No attendance records yet. Students will appear here as they mark attendance.
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {data.records.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{record.studentName}</p>
                  <p className="text-sm text-muted-foreground">{record.studentEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {record.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
