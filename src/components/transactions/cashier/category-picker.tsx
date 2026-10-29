"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChoiceTray } from "@/components/transactions/cashier/choice-tray";
import { matchExistingCategory, splitVisible } from "@/lib/transaction-cashier/suggestions";

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
      <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => setExpanded(false)}>
        <ArrowLeft className="size-4" aria-hidden="true" />
        Kategori populer
      </Button>
      {hidden.length > 0 && (
        <div className="max-h-40 overflow-y-auto">
          <ChoiceTray choices={hidden.map((c) => ({ id: c, label: c }))} onPick={onPick} />
        </div>
      )}
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          onPick(matchExistingCategory(draft, categories));
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
