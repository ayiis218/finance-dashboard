"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { FlowAccount } from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

// Kasir baru dimuat saat dialog pertama kali dibuka, jadi tidak membesarkan bundle awal halaman.
const CashierFlow = dynamic(
  () => import("@/components/transactions/cashier/cashier-flow").then((m) => m.CashierFlow),
  { ssr: false, loading: () => <p className="py-10 text-center text-sm text-muted-foreground">Memanggil kasir…</p> },
);

/** Tombol "Catat cepat": membuka kasir berkarakter sebagai mode tambahan di samping form Add. */
export function QuickEntryButton({
  accounts,
  categories,
  suggestions,
}: Readonly<{
  accounts: FlowAccount[];
  categories: string[];
  suggestions: TransactionSuggestions;
}>) {
  const [open, setOpen] = useState(false);
  const inProgress = useRef(false);
  const trackProgress = useCallback((value: boolean) => {
    inProgress.current = value;
  }, []);

  // Esc, klik di luar, dan tombol X lewat sini; "Selesai" menutup langsung karena sudah tercatat.
  function handleOpenChange(next: boolean) {
    if (!next && inProgress.current && !window.confirm("Batalkan pencatatan yang belum selesai?")) return;
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="sm" variant="outline" className="cursor-pointer" />}>
        <MessageCircle className="size-4" aria-hidden="true" />
        Catat cepat
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Catat cepat</DialogTitle>
          <DialogDescription className="sr-only">
            Ngobrol dengan kasir untuk mencatat pengeluaran, pemasukan, atau transfer dengan memilih tombol.
          </DialogDescription>
        </DialogHeader>
        <CashierFlow
          accounts={accounts}
          categories={categories}
          suggestions={suggestions}
          onClose={() => setOpen(false)}
          onProgressChange={trackProgress}
        />
      </DialogContent>
    </Dialog>
  );
}
