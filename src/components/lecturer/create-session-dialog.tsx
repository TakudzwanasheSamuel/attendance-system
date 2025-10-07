"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { QrCode, ClipboardCopy, Check } from "lucide-react";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import type { AttendanceSession } from "@/lib/types";
import { useState, useEffect } from "react";
import { Badge } from "../ui/badge";

interface CreateSessionDialogProps {
  courseId: string;
  activeSession: AttendanceSession | undefined;
}

export function CreateSessionDialog({ activeSession }: CreateSessionDialogProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  const qrImage = PlaceHolderImages.find((p) => p.id === "qr-code");
  const sessionCode = activeSession?.code || "ACTIVE123";

  useEffect(() => {
    if (activeSession) {
      const interval = setInterval(() => {
        const now = new Date();
        const expiry = activeSession.expiresAt;
        const diff = expiry.getTime() - now.getTime();

        if (diff <= 0) {
          setTimeLeft("Expired");
          clearInterval(interval);
          return;
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [activeSession]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sessionCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <QrCode className="mr-2 h-4 w-4" />
          {activeSession ? "View Active Session" : "Create New Session"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">
            {activeSession ? "Active Attendance Session" : "New Session Created"}
          </DialogTitle>
          <DialogDescription>
            Students can now mark their attendance using this code.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-6 py-4">
          {qrImage && (
            <div className="p-4 bg-white rounded-lg border shadow-sm">
              <Image
                src={qrImage.imageUrl}
                alt={qrImage.description}
                data-ai-hint={qrImage.imageHint}
                width={256}
                height={256}
                className="rounded-md"
              />
            </div>
          )}
          <div className="w-full text-center">
            <p className="text-sm text-muted-foreground">Session Code</p>
            <div className="flex items-center justify-center gap-4 mt-2">
                <p className="text-3xl font-bold tracking-widest font-code text-primary">
                    {sessionCode}
                </p>
                <Button variant="ghost" size="icon" onClick={copyToClipboard} aria-label="Copy code">
                    {isCopied ? <Check className="h-5 w-5 text-accent-foreground" /> : <ClipboardCopy className="h-5 w-5" />}
                </Button>
            </div>
          </div>
        </div>
        <DialogFooter className="sm:justify-center">
            {activeSession && timeLeft && (
                 <Badge variant="secondary" className="text-lg">
                    Expires in: <span className="font-mono ml-2 font-bold">{timeLeft}</span>
                 </Badge>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
