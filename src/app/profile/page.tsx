import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Not Authenticated</CardTitle>
            <CardDescription>Please log in to view your profile.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userPayload = verifyToken(token);
  if (!userPayload) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Invalid Session</CardTitle>
            <CardDescription>Your session is invalid. Please log in again.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    select: { id: true, name: true, email: true, role: true }
  });

  if (!user) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">User Not Found</CardTitle>
            <CardDescription>The current user could not be found.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight font-headline">My Profile</h2>
        <p className="text-muted-foreground">Update your personal information and change your password.</p>
      </div>
      <ProfileForm user={user} />
    </div>
  );
}


