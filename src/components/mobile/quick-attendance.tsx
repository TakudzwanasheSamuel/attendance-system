"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, MapPin, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface QuickAttendanceProps {
  className?: string;
}

export function QuickAttendance({ className }: QuickAttendanceProps) {
  const [sessionCode, setSessionCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        toast.success('Location obtained successfully');
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setLocationError(errorMessage);
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionCode) {
      toast.error('Please enter session code');
      return;
    }

    setIsLoading(true);

    try {
      // First, try to find the session by code
      const sessionResponse = await fetch('/api/sessions/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: sessionCode })
      });

      if (!sessionResponse.ok) {
        throw new Error('Invalid session code');
      }

      const { sessionId } = await sessionResponse.json();

      // Mark attendance using authenticated session
      const attendanceData: any = {
        sessionId
      };

      if (location) {
        attendanceData.latitude = location.latitude;
        attendanceData.longitude = location.longitude;
      }

      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(attendanceData)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Attendance marked successfully!');
        setSessionCode('');
        setLocation(null);
      } else {
        toast.error(result.error || 'Failed to mark attendance');
      }

    } catch (error) {
      console.error('Attendance error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to mark attendance');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          Quick Attendance
        </CardTitle>
        <CardDescription>
          Enter session code to mark your attendance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionCode">Session Code</Label>
            <Input
              id="sessionCode"
              type="text"
              placeholder="Enter session code"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              className="text-center text-lg font-mono tracking-wider"
              maxLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label>Location Verification</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                className="flex-1"
                disabled={isLoading}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {location ? 'Location Obtained' : 'Get Location'}
              </Button>
              {location && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4" />
                </div>
              )}
            </div>
            {locationError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {locationError}
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Marking Attendance...
              </>
            ) : (
              'Mark Attendance'
            )}
          </Button>
        </form>

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            Having trouble? Try scanning the QR code with your camera app
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
