"use client";

import { Button } from "@/components/ui/button";
import { QrCode, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface CreateSessionDialogProps {
  courseId: string;
  activeSession: any; // Updated to match the database structure
}

export function CreateSessionDialog({ courseId, activeSession }: CreateSessionDialogProps) {
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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
          duration: 15 // 15 minutes default
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Session Created",
          description: "New attendance session has been created successfully.",
        });
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
    <Button 
      onClick={handleCreateSession}
      disabled={isCreating}
    >
      {isCreating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating Session...
        </>
      ) : (
        <>
          <QrCode className="mr-2 h-4 w-4" />
          {activeSession ? "View Active Session" : "Create New Session"}
        </>
      )}
    </Button>
  );
}
