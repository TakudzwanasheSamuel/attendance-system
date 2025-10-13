"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";

interface EnrollButtonProps {
  courseId: string;
  courseName: string;
  studentId: string;
}

export function EnrollButton({ courseId, courseName, studentId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          studentId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully enrolled in ${courseName}!`);
        router.refresh(); // Refresh the page to update the UI
      } else {
        toast.error(data.error || 'Failed to enroll in course');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error('An error occurred while enrolling');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleEnroll} 
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Enrolling...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Enroll in Course
        </>
      )}
    </Button>
  );
}
