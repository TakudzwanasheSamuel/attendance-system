import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { UserNav } from "@/components/shared/user-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { LayoutDashboard, History } from "lucide-react";
import React from "react";

const studentNavItems: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/student/history", label: "My History", icon: <History /> },
];

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the current user from the auth token
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  let studentName = "Student";
  let studentEmail = "";
  
  if (token) {
    const userPayload = verifyToken(token);
    
    if (userPayload && userPayload.role === 'STUDENT') {
      const student = await prisma.user.findUnique({
        where: { id: userPayload.id },
        select: {
          name: true,
          email: true
        }
      });
      
      if (student) {
        studentName = student.name;
        studentEmail = student.email;
      }
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar navItems={studentNavItems} />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-lg font-semibold font-headline">Student Portal</h1>
          </div>
          <UserNav name={studentName} email={studentEmail} />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
