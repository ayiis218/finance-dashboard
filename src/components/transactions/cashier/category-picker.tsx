"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceTray } from "@/components/transactions/cashier/choice-tray";
import { splitVisible } from "@/lib/transaction-cashier/suggestions";

/** Beberapa kategori favorit sebagai tombol; "Lainnya…" membuka sisanya dan kolom kategori baru. */
export function CategoryPicker({
  categories,
  onPick,
}: Readonly<{ categories: string[]; onPick: (category: string) => void }>) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const { visible, hidden } = splitVisible(categories);

  if (!expanded) {
    return (
      <ChoiceTray
        choices={[...visible.map((c) => ({ id: c, label: c })), { id: "", label: "Lainnya…" }]}
        onPick={(id) => (id ? onPick(id) : setExpanded(true))}
      />
    );
  }

  return (
    <div className="space-y-3">
      {hidden.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          <ChoiceTray choices={hidden.map((c) => ({ id: c, label: c }))} onPick={onPick} />
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onPick(draft);
        }}
      >
        <Input
          aria-label="Kategori baru"
          placeholder="Kategori baru"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
          className="h-11 text-base"
        />
        <Button type="submit" size="lg" className="h-11" disabled={!draft.trim()}>
          Pakai
        </Button>
      </form>
    </div>
  );
}
