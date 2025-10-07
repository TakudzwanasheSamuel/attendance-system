import { LoginForm } from "@/components/auth/login-form";
import { BookOpenCheck } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <BookOpenCheck className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold mt-4 font-headline tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2">
            Login to access your dashboard.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
