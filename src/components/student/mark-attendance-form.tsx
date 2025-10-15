"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, QrCode, AlertCircle, CheckCircle2 } from "lucide-react";
import { markAttendance } from "@/app/student/actions";
import { getUserLocation } from "@/lib/geo-utils";

export function MarkAttendanceForm() {
  const [sessionCode, setSessionCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [locationStatus, setLocationStatus] = useState<"idle" | "requesting" | "granted" | "denied">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    setLocationStatus("requesting");

    try {
      // Get user location
      let location: { latitude: number; longitude: number } | undefined;
      try {
        location = await getUserLocation();
        setLocationStatus("granted");
      } catch (error) {
        console.warn("Location access denied or unavailable:", error);
        setLocationStatus("denied");
        // Continue without location - server will decide if it's required
      }

      // Mark attendance
      const response = await markAttendance({
        sessionCode,
        latitude: location?.latitude,
        longitude: location?.longitude,
        userAgent: navigator.userAgent,
      });

      setResult(response);

      // Clear form on success
      if (response.isValidSession && response.isEnrolled && !response.requiresLocation) {
        setSessionCode("");
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setResult({
        isValidSession: false,
        isEnrolled: false,
        validationMessage: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Mark Attendance
        </CardTitle>
        <CardDescription>
          Enter the session code provided by your lecturer or scan the QR code
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionCode">Session Code</Label>
            <Input
              id="sessionCode"
              placeholder="e.g., ABC123"
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              disabled={isLoading}
              required
              className="uppercase"
            />
          </div>

          {locationStatus === "requesting" && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Requesting location permission...
              </AlertDescription>
            </Alert>
          )}

          {locationStatus === "denied" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Location access denied. Some sessions may require location verification.
              </AlertDescription>
            </Alert>
          )}

          {locationStatus === "granted" && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Location detected successfully
              </AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert
              className={
                result.isValidSession && result.isEnrolled && !result.requiresLocation
                  ? "border-green-200 bg-green-50 text-green-800"
                  : "border-red-200 bg-red-50 text-red-800"
              }
            >
              {result.isValidSession && result.isEnrolled && !result.requiresLocation ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>
                <p className="font-medium">{result.validationMessage}</p>
                {result.distance && (
                  <p className="text-sm mt-1">
                    Distance from venue: {result.distance}m
                  </p>
                )}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">Warnings:</p>
                    {result.warnings.map((warning: string, index: number) => (
                      <p key={index} className="text-sm">
                        • {warning}
                      </p>
                    ))}
                  </div>
                )}
                {result.requiresVerification && (
                  <p className="text-sm mt-2">
                    ⚠️ Your attendance has been flagged for manual verification by your lecturer.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isLoading || !sessionCode}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Mark Attendance
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="text-sm font-medium mb-2">How it works:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Enter the session code provided by your lecturer</li>
            <li>• Location verification may be required for some sessions</li>
            <li>• Attendance is marked instantly if all checks pass</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
