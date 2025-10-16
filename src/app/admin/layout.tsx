import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { UserNav } from "@/components/shared/user-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { admins } from "@/lib/mock-data";
import { LayoutDashboard, Users, BookMarked, BarChart3, MapPin, Mail } from "lucide-react";
import React from "react";

const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/admin/users", label: "User Management", icon: <Users /> },
  { href: "/admin/courses", label: "Course Management", icon: <BookMarked /> },
  { href: "/admin/geofences", label: "Geofence Management", icon: <MapPin /> },
  { href: "/admin/parent-emails", label: "Parent Emails", icon: <Mail /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart3 /> },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = admins[0]; // Mock current user

  return (
    <SidebarProvider>
      <AppSidebar navItems={adminNavItems} />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden"/>
            <h1 className="text-lg font-semibold font-headline">Admin Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <UserNav name={admin.name} email={admin.email} />
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
