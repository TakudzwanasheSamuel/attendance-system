import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { UserNav } from "@/components/shared/user-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { students } from "@/lib/mock-data";
import { LayoutDashboard, History } from "lucide-react";
import React from "react";

const studentNavItems: NavItem[] = [
  { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/student/history", label: "My History", icon: <History /> },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const student = students[0]; // Mock current user

  return (
    <SidebarProvider>
      <AppSidebar navItems={studentNavItems} />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-lg font-semibold font-headline">Student Portal</h1>
          </div>
          <UserNav name={student.name} email={student.email} />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
