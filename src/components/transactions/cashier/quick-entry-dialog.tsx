"use client";

import { useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

/**
 * Dialog kasir yang dikendalikan dari luar (`open`/`onOpenChange`) — dipakai
 * bersama oleh tombol di halaman Transactions dan FAB global. `children`
 * adalah slot untuk `DialogTrigger` (hanya tombol Transactions yang memakainya).
 * Konfirmasi tutup-saat-belum-selesai hidup di sini, jadi perilakunya sama
 * dari pintu masuk manapun.
 */
export function QuickEntryDialog({
  open,
  onOpenChange,
  accounts,
  categories,
  suggestions,
  children,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: FlowAccount[];
  categories: string[];
  suggestions: TransactionSuggestions;
  children?: React.ReactNode;
}>) {
  const guard = useRef<CloseGuard>("free");
  const trackGuard = useCallback((value: CloseGuard) => {
    guard.current = value;
  }, []);

  // Esc, klik di luar, dan tombol X lewat sini; "Selesai" menutup langsung karena sudah tercatat.
  function handleOpenChange(next: boolean) {
    const question = next ? null : CLOSE_QUESTIONS[guard.current];
    if (question && !window.confirm(question)) return;
    onOpenChange(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
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
          onClose={() => onOpenChange(false)}
          onCloseGuardChange={trackGuard}
        />
      </DialogContent>
    </Dialog>
  );
}
