"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/** Setelah selama ini masih menyimpan, user diberi tahu supaya tidak menutup dan mengetik ulang. */
export const SLOW_SAVE_MS = 4000;

/** Keadaan "Menyimpan…"; berubah jadi peringatan bila penyimpanan lambat. Live region supaya dibacakan. */
export function SavingNotice() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlow(true), SLOW_SAVE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div role="status" aria-live="polite" className="space-y-1 py-3 text-center text-sm text-muted-foreground">
      <p className="flex items-center justify-center gap-2">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Menyimpan…
      </p>
      {slow && <p>Masih menyimpan, jaringan sedang lambat. Mohon tunggu, tidak perlu menyimpan ulang.</p>}
    </div>
  );
}
