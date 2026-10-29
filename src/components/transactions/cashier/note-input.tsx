"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Catatan opsional: Enter dengan kolom kosong sama dengan "Lewati". */
export function NoteInput({ onSubmit }: Readonly<{ onSubmit: (note: string | null) => void }>) {
  const [note, setNote] = useState("");

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(note.trim() || null);
      }}
    >
      <Input
        aria-label="Catatan"
        placeholder="Contoh: makan siang bareng tim"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        autoFocus
        className="h-11 text-base"
      />
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" size="lg" variant="outline" className="h-11 text-base" onClick={() => onSubmit(null)}>
          Lewati
        </Button>
        <Button type="submit" size="lg" className="h-11 text-base" disabled={!note.trim()}>
          Simpan catatan
        </Button>
      </div>
    </form>
  );
}
