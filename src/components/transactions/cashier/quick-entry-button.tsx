"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogTrigger } from "@/components/ui/dialog";
import { QuickEntryDialog } from "@/components/transactions/cashier/quick-entry-dialog";
import type { FlowAccount } from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

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

  return (
    <QuickEntryDialog
      open={open}
      onOpenChange={setOpen}
      accounts={accounts}
      categories={categories}
      suggestions={suggestions}
    >
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
    </QuickEntryDialog>
  );
}
