"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceTray } from "@/components/transactions/cashier/choice-tray";
import { quickDates } from "@/lib/transaction-cashier/flow";

const PICK_ID = "pick";

/** Hari ini / Kemarin sebagai tombol, atau pilih tanggal sendiri. */
export function DateStep({ today, onPick }: Readonly<{ today: string; onPick: (date: string) => void }>) {
  const [picking, setPicking] = useState(false);
  const [custom, setCustom] = useState(today);

  if (!picking) {
    return (
      <ChoiceTray
        choices={[...quickDates(today).map((d) => ({ id: d.value, label: d.label })), { id: PICK_ID, label: "Pilih tanggal" }]}
        onPick={(id) => (id === PICK_ID ? setPicking(true) : onPick(id))}
      />
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onPick(custom);
      }}
    >
      <Input
        type="date"
        aria-label="Tanggal"
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        required
        autoFocus
        className="h-11 text-base"
      />
      <Button type="submit" size="lg" className="h-11" disabled={!custom}>
        Pakai
      </Button>
    </form>
  );
}
