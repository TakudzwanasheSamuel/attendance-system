import { SignupForm } from "@/components/auth/signup-form";
import { BookOpenCheck } from "lucide-react";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <BookOpenCheck className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold mt-4 font-headline tracking-tight">
            Create an Account
          </h1>
          <p className="text-muted-foreground mt-2">
            Join the smart attendance revolution.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
