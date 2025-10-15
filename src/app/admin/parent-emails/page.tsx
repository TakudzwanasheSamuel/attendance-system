import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { ParentEmailManagement } from '@/components/admin/parent-email-management';
import { notFound } from 'next/navigation';

export default async function ParentEmailsPage() {
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Not Authenticated</h2>
          <p className="text-muted-foreground">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  // Verify the token and get user info
  const userPayload = verifyToken(token);
  
  if (!userPayload || userPayload.role !== 'ADMIN') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Access Denied</h2>
          <p className="text-muted-foreground">This page is only accessible to administrators.</p>
        </div>
      </div>
    );
  }

  // Get all students
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' },
    select: {
      id: true,
      name: true,
      email: true,
      parentName: true,
      parentEmail: true,
      parentPhone: true,
      relationship: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="space-y-6">
      <ParentEmailManagement 
        students={students}
        onUpdateStudent={async (studentId, data) => {
          'use server';
          await prisma.user.update({
            where: { id: studentId },
            data: {
              parentName: data.parentName,
              parentEmail: data.parentEmail,
              parentPhone: data.parentPhone,
              relationship: data.relationship
            }
          });
        }}
      />
    </div>
  );
}
