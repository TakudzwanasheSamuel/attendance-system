"use client";

import { Button } from "@/components/ui/button";
import { QrCode, Loader2, Clock } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateSessionDialogProps {
  courseId: string;
  activeSession: any; // Updated to match the database structure
}

export function CreateSessionDialog({ courseId, activeSession }: CreateSessionDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [duration, setDuration] = useState(15);
  const [startDelay, setStartDelay] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleCreateSession = async () => {
    if (activeSession) {
      // If there's already an active session, redirect to it
      router.push(`/lecturer/courses/${courseId}/session/${activeSession.id}`);
      return;
    }

    // Validate duration
    if (duration < 1 || duration > 180) {
      toast({
        variant: "destructive",
        title: "Invalid Duration",
        description: "Duration must be between 1 and 180 minutes.",
      });
      return;
    }

    // Validate start delay
    if (startDelay < 0 || startDelay > 60) {
      toast({
        variant: "destructive",
        title: "Invalid Start Delay",
        description: "Start delay must be between 0 and 60 minutes.",
      });
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
          startDelay: startDelay
        }),
      });

      const result = await response.json();

      if (result.success) {
        const delayMsg = startDelay > 0 ? ` Students can start recording in ${startDelay} minutes.` : '';
        toast({
          title: "Session Created",
          description: `Attendance session created for ${duration} minutes.${delayMsg}`,
        });
        setIsDialogOpen(false);
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

  if (activeSession) {
    return (
      <Button onClick={handleCreateSession}>
        <QrCode className="mr-2 h-4 w-4" />
        View Active Session
      </Button>
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          Create New Session
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Attendance Session</DialogTitle>
          <DialogDescription>
            Configure the attendance session timing. Set when students can start recording and how long the session will last.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDelay" className="text-right">
              Start Delay
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="startDelay"
                type="number"
                min="0"
                max="60"
                value={startDelay}
                onChange={(e) => setStartDelay(parseInt(e.target.value) || 0)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                minutes
              </span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="duration"
                type="number"
                min="1"
                max="180"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 15)}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                minutes
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground px-4 space-y-1">
            <p>• Start Delay: Time before students can begin recording (0 = immediate)</p>
            <p>• Duration: How long students have to record attendance</p>
            <p>• Students must be within 50 meters of the session location</p>
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleCreateSession}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <QrCode className="mr-2 h-4 w-4" />
                Create Session
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
