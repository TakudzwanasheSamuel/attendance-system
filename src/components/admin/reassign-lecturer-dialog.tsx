"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Loader2, UserCog } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { reassignCourseLecturer } from "@/lib/database-actions";
import { useRouter } from "next/navigation";
import type { Course, Lecturer } from "@/lib/types";

interface ReassignLecturerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: Course;
  lecturers: Lecturer[];
}

const formSchema = z.object({
  lecturerId: z.string({ required_error: "Please select a lecturer." }),
});

type FormValues = z.infer<typeof formSchema>;

export function ReassignLecturerDialog({
  open,
  onOpenChange,
  course,
  lecturers,
}: ReassignLecturerDialogProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lecturerId: course.lecturerId || "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsLoading(true);
      await reassignCourseLecturer(course.id, data.lecturerId);

      const newLecturer = lecturers.find((l) => l.id === data.lecturerId);
      toast({
        title: "Lecturer Reassigned",
        description: `Course "${course.name}" has been assigned to ${newLecturer?.name}.`,
      });
      
      onOpenChange(false);
      router.refresh();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to reassign lecturer",
        description: err?.message || "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const currentLecturer = lecturers.find((l) => l.id === course.lecturerId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Reassign Lecturer
          </DialogTitle>
          <DialogDescription>
            Change the lecturer assigned to "{course.name}" ({course.code}).
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="text-sm text-muted-foreground mb-4">
            <span className="font-medium">Current Lecturer:</span>{" "}
            {currentLecturer?.name || "None"}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="lecturerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Lecturer</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a lecturer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lecturers.map((lecturer) => (
                          <SelectItem key={lecturer.id} value={lecturer.id}>
                            <div className="flex flex-col">
                              <span>{lecturer.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {lecturer.email}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reassign Lecturer
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
