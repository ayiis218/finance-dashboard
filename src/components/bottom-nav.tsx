"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Landmark, Wallet, ClipboardList, BarChart3 } from "lucide-react";
import { ROUTES } from "@/lib/registry/route";
import { cn } from "@/lib/utils";

const sideItems = [
  { title: "Dashboard", url: ROUTES.dashboard, icon: LayoutDashboard },
  { title: "Accounts", url: ROUTES.accounts, icon: Landmark },
];

const centerItem = { title: "Transactions", url: ROUTES.transactions.list, icon: Wallet };

const trailingItems = [
  { title: "Budget", url: ROUTES.budgets, icon: ClipboardList },
  { title: "Reports", url: ROUTES.reports, icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {sideItems.map((item) => (
        <NavItem key={item.url} item={item} active={pathname === item.url} />
      ))}

      <Link
        href={centerItem.url}
        className="relative flex flex-col items-center justify-end pb-1.5"
        aria-current={pathname === centerItem.url ? "page" : undefined}
      >
        <span className="bg-brand-gradient -mt-5 flex size-12 items-center justify-center rounded-full text-white shadow-md ring-4 ring-card">
          <centerItem.icon className="size-5" />
        </span>
        <span className="mt-1 text-[11px] font-medium text-muted-foreground">
          {centerItem.title}
        </span>
      </Link>

      {trailingItems.map((item) => (
        <NavItem key={item.url} item={item} active={pathname === item.url} />
      ))}
    </nav>
  );
}

function NavItem({
  item,
  active,
}: Readonly<{
  item: { title: string; url: string; icon: React.ComponentType<{ className?: string }> };
  active: boolean;
}>) {
  return (
    <Link
      href={item.url}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium",
        active ? "text-primary" : "text-muted-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      <item.icon className="size-5" />
      {item.title}
    </Link>
  );
}
