import { AppSidebar, type NavItem } from "@/components/shared/app-sidebar";
import { UserNav } from "@/components/shared/user-nav";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LayoutDashboard, Users, BookOpen, BarChart3, User as UserIcon, History } from "lucide-react";

function getNavItemsForRole(role: string): NavItem[] {
  if (role === 'ADMIN') {
    return [
      { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
      { href: "/admin/users", label: "Users", icon: <Users /> },
      { href: "/admin/courses", label: "Courses", icon: <BookOpen /> },
      { href: "/admin/reports", label: "Reports", icon: <BarChart3 /> },
      { href: "/profile", label: "Profile", icon: <UserIcon /> },
    ];
  }
  if (role === 'LECTURER') {
    return [
      { href: "/lecturer/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
      { href: "/lecturer/reports", label: "Reports", icon: <BarChart3 /> },
      { href: "/profile", label: "Profile", icon: <UserIcon /> },
    ];
  }
  return [
    { href: "/student/dashboard", label: "Dashboard", icon: <LayoutDashboard /> },
    { href: "/student/history", label: "History", icon: <History /> },
    { href: "/profile", label: "Profile", icon: <UserIcon /> },
  ];
}

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  const payload = token ? verifyToken(token) : null;

  const user = payload
    ? await prisma.user.findUnique({ where: { id: payload.id }, select: { name: true, email: true, role: true } })
    : null;

  const name = user?.name || "User";
  const email = user?.email || "";
  const role = user?.role || 'STUDENT';
  const navItems = getNavItemsForRole(role);

  return (
    <SidebarProvider>
      <AppSidebar navItems={navItems} />
      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-lg font-semibold font-headline">My Profile</h1>
          </div>
          <UserNav name={name} email={email} />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}


