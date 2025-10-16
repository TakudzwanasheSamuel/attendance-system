"use client";

import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface OpenStudentPageButtonProps {
  sessionId: string;
  className?: string;
}

export function OpenStudentPageButton({ sessionId, className }: OpenStudentPageButtonProps) {
  const handleOpenStudentPage = () => {
    window.open(`/attendance/${sessionId}`, '_blank');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleOpenStudentPage}
      className={`flex items-center gap-2 ${className || ''}`}
    >
      <ExternalLink className="h-4 w-4" />
      Open Student Page
    </Button>
  );
}
