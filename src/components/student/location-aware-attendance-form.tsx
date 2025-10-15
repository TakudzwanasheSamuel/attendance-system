"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, CheckCircle, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { 
  getCurrentLocation, 
  validateLocationAccuracy, 
  formatDistance,
  requestLocationPermission,
  getLocationPermissionStatus,
  type Location 
} from '@/lib/geofencing';

interface AttendanceSession {
  id: string;
  code: string;
  course: {
    name: string;
    code: string;
  };
  expiresAt: Date;
  geofence?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  };
  requireLocation: boolean;
}

interface LocationAwareAttendanceFormProps {
  session: AttendanceSession;
  onMarkAttendance: (sessionId: string, code: string, location?: Location) => Promise<void>;
}

export function LocationAwareAttendanceForm({ 
  session, 
  onMarkAttendance 
}: LocationAwareAttendanceFormProps) {
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [location, setLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState>('prompt');
  const [locationValidation, setLocationValidation] = useState<{
    isValid: boolean;
    isSuspicious: boolean;
    warnings: string[];
  } | null>(null);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const status = await getLocationPermissionStatus();
      setPermissionStatus(status);
    } catch (error) {
      console.error('Error checking location permission:', error);
    }
  };

  const requestLocation = async () => {
    setIsLocationLoading(true);
    setLocationError(null);
    setLocationValidation(null);

    try {
      // Request permission first
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationError('Location permission denied. Please enable location access in your browser settings.');
        return;
      }

      // Get current location
      const currentLocation = await getCurrentLocation({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });

      setLocation(currentLocation);

      // Validate location accuracy
      const validation = validateLocationAccuracy(currentLocation);
      setLocationValidation(validation);

      if (validation.isSuspicious) {
        toast({
          title: "Location Warning",
          description: "Location accuracy may be low. Please ensure you're in the correct location.",
          variant: "destructive",
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get location';
      setLocationError(errorMessage);
      toast({
        title: "Location Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLocationLoading(false);
    }
  };

  const isLocationValid = () => {
    if (!session.requireLocation || !session.geofence) {
      return true; // No location requirement
    }

    if (!location || !locationValidation) {
      return false;
    }

    if (!locationValidation.isValid || locationValidation.isSuspicious) {
      return false;
    }

    // Check if within geofence
    const distance = calculateDistance(
      location.latitude,
      location.longitude,
      session.geofence.latitude,
      session.geofence.longitude
    );

    return distance <= session.geofence.radius;
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const getDistanceFromGeofence = () => {
    if (!session.geofence || !location) return null;
    
    return calculateDistance(
      location.latitude,
      location.longitude,
      session.geofence.latitude,
      session.geofence.longitude
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attendanceCode !== session.code) {
      toast({
        title: "Invalid Code",
        description: "The attendance code you entered is incorrect.",
        variant: "destructive",
      });
      return;
    }

    if (!isLocationValid()) {
      toast({
        title: "Location Required",
        description: "You must be within the designated area to mark attendance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onMarkAttendance(session.id, attendanceCode, location || undefined);
      toast({
        title: "Success",
        description: "Attendance marked successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = new Date() > new Date(session.expiresAt);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mark Attendance
        </CardTitle>
        <CardDescription>
          {session.course.name} ({session.course.code})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isExpired && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              This attendance session has expired.
            </AlertDescription>
          </Alert>
        )}

        {session.requireLocation && session.geofence && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Location Verification</Label>
              <Badge variant="outline">
                {session.geofence.name}
              </Badge>
            </div>
            
            {permissionStatus === 'denied' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Location access is denied. Please enable location permissions in your browser settings.
                </AlertDescription>
              </Alert>
            )}

            {!location && !isLocationLoading && (
              <Button 
                variant="outline" 
                onClick={requestLocation}
                disabled={permissionStatus === 'denied'}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Get My Location
              </Button>
            )}

            {isLocationLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Getting location...</span>
              </div>
            )}

            {locationError && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{locationError}</AlertDescription>
              </Alert>
            )}

            {location && locationValidation && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isLocationValid() ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <span className="text-sm">
                    {isLocationValid() ? 'Location verified' : 'Location not verified'}
                  </span>
                </div>

                {locationValidation.warnings.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside">
                        {locationValidation.warnings.map((warning, index) => (
                          <li key={index}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {session.geofence && (
                  <div className="text-sm text-muted-foreground">
                    <div>📍 Your location: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</div>
                    <div>🎯 Geofence center: {session.geofence.latitude.toFixed(6)}, {session.geofence.longitude.toFixed(6)}</div>
                    <div>📏 Distance: {formatDistance(getDistanceFromGeofence() || 0)}</div>
                    <div>📐 Required radius: {session.geofence.radius}m</div>
                    {location.accuracy && (
                      <div>🎯 Accuracy: ±{Math.round(location.accuracy)}m</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attendanceCode">Attendance Code</Label>
            <Input
              id="attendanceCode"
              type="text"
              value={attendanceCode}
              onChange={(e) => setAttendanceCode(e.target.value.toUpperCase())}
              placeholder="Enter attendance code"
              disabled={isSubmitting || isExpired}
              className="text-center text-lg font-mono"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || isExpired || (session.requireLocation && !isLocationValid())}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking Attendance...
              </>
            ) : (
              'Mark Attendance'
            )}
          </Button>
        </form>

        {session.requireLocation && !isLocationValid() && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You must be within the designated area to mark attendance.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}


