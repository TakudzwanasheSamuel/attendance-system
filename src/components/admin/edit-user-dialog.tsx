"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "./user-form";
import type { Student, Lecturer, Admin } from "@/lib/types";

type User = (Student | Lecturer | Admin) & { role: string };

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Edit User</DialogTitle>
          <DialogDescription>
            Update the details for "{user.name}".
          </DialogDescription>
        </DialogHeader>
        <UserForm
            user={user}
            closeDialog={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
