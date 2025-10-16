"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, MapPin, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentLocation } from "@/lib/geolocation";

const locationSchema = z.object({
  locationName: z.string().min(1, "Location name is required"),
  latitude: z.number().min(-90).max(90, "Invalid latitude"),
  longitude: z.number().min(-180).max(180, "Invalid longitude"),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface CourseLocationFormProps {
  courseId: string;
  currentLocation?: {
    locationName?: string;
    latitude?: number;
    longitude?: number;
  };
  onSave: (data: LocationFormData) => Promise<void>;
}

export function CourseLocationForm({ courseId, currentLocation, onSave }: CourseLocationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const { toast } = useToast();

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      locationName: currentLocation?.locationName || "",
      latitude: currentLocation?.latitude || 0,
      longitude: currentLocation?.longitude || 0,
    },
  });

  const captureCurrentLocation = async () => {
    setIsCapturingLocation(true);
    try {
      const location = await getCurrentLocation();
      form.setValue("latitude", location.latitude);
      form.setValue("longitude", location.longitude);
      
      toast({
        title: "Location Captured",
        description: "Your current location has been set for this course.",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to get location";
      toast({
        variant: "destructive",
        title: "Location Error",
        description: errorMessage,
      });
    } finally {
      setIsCapturingLocation(false);
    }
  };

  const onSubmit = async (data: LocationFormData) => {
    setIsLoading(true);
    try {
      await onSave(data);
      toast({
        title: "Location Saved",
        description: "Course location has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save course location.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Course Location Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="locationName">Location Name</Label>
            <Input
              id="locationName"
              placeholder="e.g., Room 101, Building A"
              {...form.register("locationName")}
              disabled={isLoading}
            />
            {form.formState.errors.locationName && (
              <p className="text-sm text-red-600">{form.formState.errors.locationName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                placeholder="0.000000"
                {...form.register("latitude", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.latitude && (
                <p className="text-sm text-red-600">{form.formState.errors.latitude.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                placeholder="0.000000"
                {...form.register("longitude", { valueAsNumber: true })}
                disabled={isLoading}
              />
              {form.formState.errors.longitude && (
                <p className="text-sm text-red-600">{form.formState.errors.longitude.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={captureCurrentLocation}
              disabled={isLoading || isCapturingLocation}
              className="w-full"
            >
              {isCapturingLocation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Capturing Location...
                </>
              ) : (
                <>
                  <MapPin className="mr-2 h-4 w-4" />
                  Use Current Location
                </>
              )}
            </Button>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Students will need to be within 50 meters of this location to mark attendance.
            </AlertDescription>
          </Alert>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Location"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
