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
import type { CloseGuard, FlowAccount } from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

// Kasir baru dimuat saat dialog pertama kali dibuka, jadi tidak membesarkan bundle awal halaman.
const CashierFlow = dynamic(
  () => import("@/components/transactions/cashier/cashier-flow").then((m) => m.CashierFlow),
  { ssr: false, loading: () => <p className="py-10 text-center text-sm text-muted-foreground">Memanggil kasir…</p> },
);

const CLOSE_QUESTIONS: Record<CloseGuard, string | null> = {
  free: null,
  discard: "Batalkan pencatatan yang belum selesai?",
  saving: "Transaksi sedang disimpan. Tutup jendela ini?",
};

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
  const guard = useRef<CloseGuard>("free");
  const trackGuard = useCallback((value: CloseGuard) => {
    guard.current = value;
  }, []);

  // Esc, klik di luar, dan tombol X lewat sini; "Selesai" menutup langsung karena sudah tercatat.
  function handleOpenChange(next: boolean) {
    const question = next ? null : CLOSE_QUESTIONS[guard.current];
    if (question && !window.confirm(question)) return;
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/*
       * Tint mustard (`--chart-cat-4`, token global tervalidasi) + titik lampu
       * berpendar (`cashier-glow`, keyframe yang sudah diaudit kontras/reduced-
       * motion-nya) — hint kehangatan sebelum dialog kasir terbuka, bukan
       * cuma berubah total begitu masuk.
       */}
      <DialogTrigger
        render={
          <Button
            size="sm"
            variant="outline"
            className="group cursor-pointer border-[color-mix(in_oklch,var(--chart-cat-4),transparent_60%)] bg-[color-mix(in_oklch,var(--chart-cat-4),var(--background)_88%)] transition-transform hover:bg-[color-mix(in_oklch,var(--chart-cat-4),var(--background)_78%)] active:scale-95"
          />
        }
      >
        <span className="cashier-scene relative inline-flex size-4 items-center justify-center">
          <span
            aria-hidden="true"
            className="cashier-glow absolute inset-0 rounded-full bg-[var(--chat-lamp)] blur-[3px]"
          />
          <MessageCircle
            className="relative size-4 transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110"
            aria-hidden="true"
          />
        </span>
        Catat cepat
      </DialogTrigger>
      <DialogContent className="cashier-scene bg-[var(--chat-paper)] ring-[var(--chat-wood)]/30 data-open:slide-in-from-bottom-2 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-hand flex items-center gap-2 text-lg">
            <span
              aria-hidden="true"
              className="cashier-glow inline-flex size-2 shrink-0 rounded-full bg-[var(--chat-lamp)]"
            />
            Catat cepat
          </DialogTitle>
          <DialogDescription className="sr-only">
            Ngobrol dengan kasir untuk mencatat pengeluaran, pemasukan, atau transfer dengan memilih tombol.
          </DialogDescription>
        </DialogHeader>
        <CashierFlow
          accounts={accounts}
          categories={categories}
          suggestions={suggestions}
          onClose={() => setOpen(false)}
          onCloseGuardChange={trackGuard}
        />
      </DialogContent>
    </Dialog>
  );
}
