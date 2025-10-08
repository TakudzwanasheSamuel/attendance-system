"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const attendanceSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  sessionId: string;
  sessionCode: string;
  isActive: boolean;
}

export function AttendanceForm({ sessionId, sessionCode, isActive }: AttendanceFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: AttendanceFormData) => {
    if (!isActive) {
      toast({
        variant: "destructive",
        title: "Session Expired",
        description: "This attendance session has expired.",
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResult({
          success: true,
          message: "Attendance marked successfully! You are now marked as present."
        });
        toast({
          title: "Attendance Marked",
          description: "You have been marked as present for this session.",
        });
        // Reset form
        form.reset();
      } else {
        setResult({
          success: false,
          message: result.error || "Failed to mark attendance. Please check your credentials and try again."
        });
        toast({
          variant: "destructive",
          title: "Attendance Failed",
          description: result.error || "Failed to mark attendance.",
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setResult({
        success: false,
        message: "An error occurred. Please try again."
      });
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while marking attendance.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {result && (
        <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
              {result.message}
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            {...form.register("email")}
            disabled={isLoading || !isActive}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              {...form.register("password")}
              disabled={isLoading || !isActive}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading || !isActive}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sessionCode">Session Code</Label>
          <Input
            id="sessionCode"
            value={sessionCode}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            This code is automatically filled for this session
          </p>
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || !isActive}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Marking Attendance...
            </>
          ) : !isActive ? (
            "Session Expired"
          ) : (
            "Mark Attendance"
          )}
        </Button>
      </form>

      {!isActive && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <p className="text-sm text-yellow-800">
              This attendance session has expired. You cannot mark your attendance at this time.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}