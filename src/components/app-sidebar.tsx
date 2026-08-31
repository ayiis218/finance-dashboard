"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  HandCoins,
  TrendingUp,
  PiggyBank,
  BarChart3,
  ClipboardList,
  LineChart,
} from "lucide-react";
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
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transaksi", url: "/transactions", icon: Wallet },
  { title: "Rekening", url: "/accounts", icon: Landmark },
  { title: "Aset", url: "/assets", icon: Landmark },
  { title: "Piutang/Utang", url: "/receivables", icon: HandCoins },
  { title: "Investasi", url: "/investments", icon: TrendingUp },
  { title: "Savings Goal", url: "/goals", icon: PiggyBank },
  { title: "Budget", url: "/budget", icon: ClipboardList },
  { title: "Cashflow Forecast", url: "/cashflow", icon: LineChart },
  { title: "Laporan", url: "/reports", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();

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
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={pathname === item.url}
                    render={<Link href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
