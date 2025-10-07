"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { markAttendance } from "@/app/student/actions";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Loader2, QrCode } from "lucide-react";

const formSchema = z.object({
  sessionCode: z.string().min(6, {
    message: "Session code must be at least 6 characters.",
  }).max(10, {
    message: "Session code must be at most 10 characters."
  }).regex(/^[A-Z0-9]+$/, {
    message: "Session code must be uppercase letters and numbers only."
  }),
});

export function AttendanceForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionCode: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await markAttendance(values.sessionCode);
    setIsLoading(false);

    if (result.isValidSession && result.isEnrolled) {
      toast({
        title: "Success!",
        description: result.validationMessage,
        variant: "default",
      });
      form.reset();
    } else {
      toast({
        title: "Validation Failed",
        description: result.validationMessage,
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="max-w-lg w-full">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <QrCode className="text-primary"/> Mark Your Attendance
            </CardTitle>
            <CardDescription>Enter the session code provided by your lecturer.</CardDescription>
        </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
            <FormField
              control={form.control}
              name="sessionCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Code</FormLabel>
                  <FormControl>
                    <Input placeholder="XYZ123" {...field} className="uppercase font-code tracking-widest text-lg h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            </CardContent>
            <CardFooter>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Attendance
            </Button>
            </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
