import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="relative h-24 w-24">
            <Image
              src="/logo.png"
              alt="App Logo"
              fill
              className="rounded-full ring-4 ring-primary shadow-lg object-cover bg-white"
              sizes="96px"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold mt-4 font-headline tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground mt-2">
            Login to access your dashboard.
          </p>
        </div>
        
        {/* Removed demo credentials notice */}

        <LoginForm />
      </div>
    </div>
  );
}
