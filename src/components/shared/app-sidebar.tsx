"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenCheck, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface AppSidebarProps {
  navItems: NavItem[];
}

export function AppSidebar({ navItems }: AppSidebarProps) {
  const pathname = usePathname();
  const { open } = useSidebar();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <BookOpenCheck className="size-8 text-primary" />
            <span className={cn(
                "font-bold text-lg font-headline",
                !open && "hidden"
            )}>
                SMS
            </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={{ children: "Log Out" }}>
              <Link href="/">
                <LogOut />
                <span>Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
