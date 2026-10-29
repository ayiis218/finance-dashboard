"use client";

import { useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/format";
import { MAX_AMOUNT, QUICK_AMOUNTS } from "@/lib/transaction-cashier/flow";

const MAX_DIGITS = String(MAX_AMOUNT).length;
const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0"] as const;

/** Keypad besar bergaya mesin kasir. Bisa juga diketik lewat keyboard (angka, Backspace, Enter). */
export function AmountKeypad({ onSubmit }: Readonly<{ onSubmit: (amount: number) => void }>) {
  const [digits, setDigits] = useState("");
  const amount = Number(digits || 0);

  const append = (key: string) => setDigits((d) => (d + key).replace(/^0+/, "").slice(0, MAX_DIGITS));
  const erase = () => setDigits((d) => d.slice(0, -1));
  const submit = () => amount > 0 && onSubmit(amount);

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (/^\d$/.test(e.key)) append(e.key);
    else if (e.key === "Backspace") erase();
    else if (e.key === "Enter" && e.target === e.currentTarget) submit();
  }

  return (
    <div
      role="group"
      aria-label="Keypad jumlah"
      tabIndex={-1}
      autoFocus
      onKeyDown={handleKeyDown}
      className="space-y-3 outline-none"
    >
      <output aria-live="polite" className="block rounded-lg bg-foreground px-4 py-3 text-right font-mono text-2xl text-background tabular-nums">
        {formatIDR(amount)}
      </output>
      <div className="flex flex-wrap gap-1.5">
        {QUICK_AMOUNTS.map((value) => (
          <Button key={value} type="button" size="sm" variant="secondary" onClick={() => setDigits(String(value))}>
            {formatIDR(value)}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {KEYS.map((key) => (
          <Button key={key} type="button" size="lg" variant="outline" className="h-12 text-lg" onClick={() => append(key)}>
            {key}
          </Button>
        ))}
        <Button type="button" size="lg" variant="outline" className="h-12" aria-label="Hapus angka terakhir" onClick={erase}>
          <Delete className="size-5" />
        </Button>
      </div>
      <Button type="button" size="lg" className="h-11 w-full text-base" disabled={amount <= 0} onClick={submit}>
        Lanjut
      </Button>
    </div>
  );
}
