import { LoginForm } from "@/components/auth/login-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpenCheck, Info } from "lucide-react";

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
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Demo Login Information</AlertTitle>
          <AlertDescription>
            Use the following credentials to log in as different users. Any password will work.
            <Table className="mt-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell className="font-mono">student@example.com</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lecturer/Teacher</TableCell>
                  <TableCell className="font-mono">lecturer@example.com</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </AlertDescription>
        </Alert>

        <LoginForm />
      </div>
    </div>
  );
}
