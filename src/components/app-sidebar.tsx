"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { navItems } from "@/lib/registry/nav-items";

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const menuItems = navItems.filter((item) => item.show)
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="bg-brand-gradient rounded-lg px-3 py-2.5 text-sm font-semibold text-white">
          Finance Dashboard
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    {/* Pill aktif meluncur antar menu lewat layoutId yang sama. */}
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        aria-hidden="true"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        className="absolute inset-0 rounded-md bg-sidebar-accent"
                      />
                    )}
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => setOpenMobile(false)}
                      className="relative z-10 data-active:bg-transparent"
                      render={<Link href={item.url} />}
                    >
                      <item.icon className="transition-transform duration-200 group-hover/menu-button:-rotate-6 group-hover/menu-button:scale-110" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
