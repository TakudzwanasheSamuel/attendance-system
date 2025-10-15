"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, Loader2, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface Geofence {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
}

interface CreateSessionDialogProps {
  courseId: string;
  activeSession: any;
}

export function EnhancedCreateSessionDialog({ courseId, activeSession }: CreateSessionDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [selectedGeofence, setSelectedGeofence] = useState<string>("");
  const [duration, setDuration] = useState<number>(15);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch available geofences
  useEffect(() => {
    const fetchGeofences = async () => {
      try {
        const response = await fetch('/api/geofences');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setGeofences(data.geofences.filter((g: Geofence) => g.isActive));
          }
        }
      } catch (error) {
        console.error('Error fetching geofences:', error);
      }
    };

    if (isOpen) {
      fetchGeofences();
    }
  }, [isOpen]);

  const handleCreateSession = async () => {
    if (activeSession) {
      // If there's already an active session, redirect to it
      router.push(`/lecturer/courses/${courseId}/session/${activeSession.id}`);
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: courseId,
          duration: duration,
          geofenceId: selectedGeofence || null
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Session Created",
          description: selectedGeofence 
            ? "New attendance session with geofencing has been created successfully."
            : "New attendance session has been created successfully.",
        });
        setIsOpen(false);
        // Redirect to the new session page
        router.push(`/lecturer/courses/${courseId}/session/${result.session.id}`);
      } else {
        toast({
          variant: "destructive",
          title: "Failed to Create Session",
          description: result.error || "Failed to create attendance session.",
        });
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while creating the session.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          {activeSession ? "View Active Session" : "Create New Session"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Attendance Session</DialogTitle>
          <DialogDescription>
            Create a new attendance session for your course. You can optionally assign a geofence for location-based attendance.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Duration Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Session Duration</label>
            <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Geofence Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Geofence (Optional)
            </label>
            <Select value={selectedGeofence} onValueChange={setSelectedGeofence}>
              <SelectTrigger>
                <SelectValue placeholder="Select a geofence for location-based attendance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No geofence (allow any location)</SelectItem>
                {geofences.map((geofence) => (
                  <SelectItem key={geofence.id} value={geofence.id}>
                    {geofence.name} ({geofence.radius}m radius)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedGeofence && (
              <div className="text-sm text-muted-foreground">
                {geofences.find(g => g.id === selectedGeofence)?.description}
              </div>
            )}
          </div>

          {/* Geofence Info */}
          {selectedGeofence && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-900 mb-1">Geofencing Enabled</div>
              <div className="text-xs text-blue-700">
                Students will need to be within the geofence radius to mark attendance.
                This helps prevent attendance fraud and ensures students are physically present.
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateSession} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Session"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
