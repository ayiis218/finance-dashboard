"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Account = { id: string; name: string };

export function TransactionFilters({ accounts }: Readonly<{ accounts: Account[] }>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative w-full sm:min-w-48 sm:flex-1">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search category or note..."
          className="pl-8"
        />
      </div>
      <select
        defaultValue={searchParams.get("type") ?? ""}
        onChange={(e) => navigate({ type: e.target.value || null }, true)}
        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm sm:w-auto"
      >
        <option value="">All Types</option>
        <option value="EXPENSE">Expense</option>
        <option value="INCOME">Income</option>
        <option value="TRANSFER">Transfer</option>
      </select>
      <select
        defaultValue={searchParams.get("accountId") ?? ""}
        onChange={(e) => navigate({ accountId: e.target.value || null }, true)}
        className="w-full rounded-md border bg-transparent px-3 py-2 text-sm sm:w-auto"
      >
        <option value="">All Accounts</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>
  );
}
