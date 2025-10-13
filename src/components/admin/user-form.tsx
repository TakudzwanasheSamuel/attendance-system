"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { user } from "@prisma/client";
import { createUser, updateUser } from "@/lib/database-actions";

interface UserFormProps {
    user?: user;
    closeDialog: () => void;
}

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email."),
  role: z.enum(["ADMIN", "LECTURER", "STUDENT"], { required_error: "Please select a role." }),
  // Password is only required for new users
  password: z.string().optional(),
}).refine(data => {
    // If it's a new user (no user prop), password is required
    if (!('id' in (data as any)) && (!data.password || data.password.length < 6)) {
        return false;
    }
    return true;
}, {
    message: "Password must be at least 6 characters for new users.",
    path: ["password"],
});


type UserFormValues = z.infer<typeof formSchema>;

export function UserForm({ user, closeDialog }: UserFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const isEditMode = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role as any || "STUDENT",
      password: "",
    },
  });
  
  async function onSubmit(data: UserFormValues) {
    setIsLoading(true);
    
    try {
      if (isEditMode && user) {
        await updateUser(user.id, {
          name: data.name,
          email: data.email,
          role: data.role as any,
          ...(data.password && { password: data.password })
        });
      } else {
        await createUser({
          name: data.name,
          email: data.email,
          password: data.password!,
          role: data.role as any
        });
      }
      
      toast({
        title: user ? "User Updated" : "User Created",
        description: `The user "${data.name}" has been successfully saved.`,
      });
      closeDialog();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., Alex Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                        <Input placeholder="e.g., john.doe@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />
            {!isEditMode && (
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="LECTURER">Lecturer</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
            />
        </div>

        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {user ? "Save Changes" : "Create User"}
            </Button>
        </div>
      </form>
    </Form>
  );
}
