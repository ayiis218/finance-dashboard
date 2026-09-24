"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

type Account = { id: string; name: string };

export function TransactionFilters({ accounts }: Readonly<{ accounts: Account[] }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const type = searchParams.get("type") ?? "";
  const accountId = searchParams.get("accountId") ?? "";
  const activeFilterCount = [type, accountId].filter(Boolean).length;

  const navigate = (updates: Record<string, string | null>, resetPage: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (resetPage) params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (q === current) return;
    const timeout = setTimeout(() => {
      navigate({ q: q || null }, true);
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 flex items-center gap-2">
      <div className="relative flex-1 sm:min-w-48 sm:max-w-sm">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search category or note..."
          className="pl-8"
        />
      </div>

      <Sheet>
        <SheetTrigger
          render={<Button variant="outline" size="icon" className="relative shrink-0 sm:hidden" />}
        >
          <SlidersHorizontal className="size-4" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </SheetTrigger>

        {/* Desktop: selects stay inline, same as before */}
        <div className="hidden items-center gap-2 sm:flex">
          <select
            defaultValue={type}
            onChange={(e) => navigate({ type: e.target.value || null }, true)}
            className="w-auto rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
            <option value="TRANSFER">Transfer</option>
          </select>
          <select
            defaultValue={accountId}
            onChange={(e) => navigate({ accountId: e.target.value || null }, true)}
            className="w-auto rounded-md border bg-transparent px-3 py-2 text-sm"
          >
            <option value="">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <SheetContent side="bottom" className="sm:hidden">
          <SheetHeader>
            <SheetTitle>Filter Transactions</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 px-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                defaultValue={type}
                onChange={(e) => navigate({ type: e.target.value || null }, true)}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">All Types</option>
                <option value="EXPENSE">Expense</option>
                <option value="INCOME">Income</option>
                <option value="TRANSFER">Transfer</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Account</label>
              <select
                defaultValue={accountId}
                onChange={(e) => navigate({ accountId: e.target.value || null }, true)}
                className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
              >
                <option value="">All Accounts</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <SheetFooter>
            <SheetClose render={<Button variant="outline" />}>Done</SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
