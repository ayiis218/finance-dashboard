"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { LayoutDashboard, Landmark, Wallet, ClipboardList, TrendingUp } from "lucide-react";
import { ROUTES } from "@/lib/registry/route";
import { cn } from "@/lib/utils";

const sideItems = [
  { title: "Dashboard", url: ROUTES.dashboard, icon: LayoutDashboard },
  { title: "Accounts", url: ROUTES.accounts, icon: Landmark },
];

const centerItem = { title: "Transactions", url: ROUTES.transactions.list, icon: Wallet };

const trailingItems = [
  { title: "Budget", url: ROUTES.budgets, icon: ClipboardList },
  { title: "Investments", url: ROUTES.investments, icon: TrendingUp },
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
        <motion.span
          whileTap={{ scale: 0.88, y: 2 }}
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="bg-brand-gradient -mt-5 flex size-12 items-center justify-center rounded-full text-white shadow-md ring-4 ring-card"
        >
          <centerItem.icon className="size-5" />
        </motion.span>
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
        "relative flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors active:scale-95",
        active ? "text-primary" : "text-muted-foreground",
      )}
      aria-current={active ? "page" : undefined}
    >
      {active && (
        <motion.span
          layoutId="bottom-nav-indicator"
          aria-hidden="true"
          transition={{ type: "spring", stiffness: 500, damping: 36 }}
          className="absolute inset-x-4 top-0 h-0.5 rounded-full bg-primary"
        />
      )}
      <motion.span
        animate={{ scale: active ? 1.15 : 1, y: active ? -1 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        <item.icon className="size-5" />
      </motion.span>
      {item.title}
    </Link>
  );
}
