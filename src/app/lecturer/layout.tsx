import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { UserNav } from "@/components/shared/user-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { lecturers } from "@/lib/mock-data";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import React from "react";

const lecturerNavItems: NavItem[] = [
  { href: "/lecturer/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/lecturer/reports", label: "Reports", icon: <BarChart3 /> },
];

export default function LecturerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lecturer = lecturers[0]; // Mock current user

  return (
    <SidebarProvider>
      <AppSidebar navItems={lecturerNavItems} />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-lg font-semibold font-headline">Lecturer Portal</h1>
          </div>
          <UserNav name={lecturer.name} email={lecturer.email} />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
