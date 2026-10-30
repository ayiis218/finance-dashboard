"use client";

import { useEffect, useRef, useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";
import {
  amountOf,
  clear,
  entryFromAmount,
  erase,
  pressKey,
  pressPreset,
  selectedPreset,
} from "@/lib/transaction-cashier/amount-entry";
import { QUICK_AMOUNTS } from "@/lib/transaction-cashier/flow";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0"] as const;

/**
 * Keypad besar bergaya mesin kasir. Bisa juga diketik lewat keyboard (angka, Backspace, Enter).
 * Aturan isiannya ada di `amount-entry.ts`; `initialAmount` mengisi ulang jawaban sebelumnya
 * saat user kembali atau mengubah jumlah dari struk.
 */
export function AmountKeypad({
  initialAmount,
  onSubmit,
}: Readonly<{ initialAmount?: number; onSubmit: (amount: number) => void }>) {
  const [entry, setEntry] = useState(() => entryFromAmount(initialAmount));
  const amount = amountOf(entry);
  const chosenPreset = selectedPreset(entry, QUICK_AMOUNTS);
  const keypadRef = useRef<HTMLDivElement>(null);

  // React mengabaikan `autoFocus` pada <div>; fokus wrapper manual supaya keyboard fisik langsung aktif.
  useEffect(() => {
    keypadRef.current?.focus();
  }, []);

  const submit = () => amount > 0 && onSubmit(amount);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    // Shortcut browser (Ctrl/Cmd/Alt + angka) tidak boleh ikut mengetik.
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (/^\d$/.test(e.key)) setEntry((current) => pressKey(current, e.key));
    else if (e.key === "Backspace") setEntry(erase);
    else if (e.key === "Enter" && e.target === e.currentTarget) submit();
  }

  return (
    <div
      ref={keypadRef}
      role="group"
      aria-label="Keypad jumlah"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className="space-y-3 outline-none"
    >
      <output aria-live="polite" className="block rounded-lg bg-foreground px-4 py-3 text-right font-mono text-2xl text-background tabular-nums">
        {formatIDR(amount)}
      </output>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={chosenPreset === value ? "default" : "secondary"}
            aria-pressed={chosenPreset === value}
            className="h-9"
            onClick={() => setEntry(pressPreset(value))}
          >
            {formatIDR(value)}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-9"
          disabled={amount === 0}
          aria-label="Bersihkan jumlah"
          onClick={() => setEntry(clear())}
        >
          Bersihkan
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <Button
            key={key}
            type="button"
            size="lg"
            variant="outline"
            className="h-12 text-lg"
            onClick={() => setEntry((current) => pressKey(current, key))}
          >
            {key}
          </Button>
        ))}
        <Button type="button" size="lg" variant="outline" className="h-12" aria-label="Hapus angka terakhir" onClick={() => setEntry(erase)}>
          <Delete className="size-5" />
        </Button>
      </div>
      <Button type="button" size="lg" className="h-11 w-full text-base" disabled={amount <= 0} onClick={submit}>
        Lanjut
      </Button>
    </div>
  );
}
