"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { QuickEntryDialog } from "@/components/transactions/cashier/quick-entry-dialog";
import { loadQuickEntryData, type QuickEntryData } from "@/lib/actions/quick-entry";
import { shouldOpenQuickEntry } from "@/lib/quick-entry-shortcut";

/**
 * Tombol mengambang "Catat cepat" di semua halaman + pintasan keyboard `n`.
 * Data kasir dimuat lazy lewat server action (prefetch saat hover/fokus), dan
 * di-refetch tiap kali dibuka supaya saran/kategori tidak basi setelah
 * transaksi baru tersimpan. Isi dialognya persis komponen kasir yang sama.
 */
export function QuickEntryFab() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<QuickEntryData | null>(null);
  const pending = useRef<Promise<QuickEntryData> | null>(null);

  const fetchData = useCallback(() => {
    pending.current ??= loadQuickEntryData().catch((error) => {
      pending.current = null;
      throw error;
    });
    return pending.current;
  }, []);

  const launch = useCallback(async () => {
    setBusy(true);
    try {
      setData(await fetchData());
      setOpen(true);
    } catch {
      toast.error("Gagal memanggil kasir. Coba lagi.");
    } finally {
      setBusy(false);
    }
  }, [fetchData]);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) pending.current = null;
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const anotherDialogOpen = document.querySelector('[data-slot="dialog-content"]') !== null;
      const { key, ctrlKey, metaKey, altKey, repeat, defaultPrevented } = event;
      const target = event.target as HTMLElement | null;
      if (
        !shouldOpenQuickEntry(
          { key, ctrlKey, metaKey, altKey, repeat, defaultPrevented, target },
          anotherDialogOpen,
        )
      ) {
        return;
      }
      event.preventDefault();
      void launch();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [launch]);

  return (
    <>
      <AnimatePresence>
        {!open && (
          <motion.button
            type="button"
            onClick={launch}
            onPointerEnter={() => void fetchData().catch(() => {})}
            onFocus={() => void fetchData().catch(() => {})}
            disabled={busy}
            aria-label="Catat cepat (tekan N)"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
            className="cashier-scene group fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex h-14 cursor-pointer items-center gap-2 rounded-full border border-[var(--chat-wood)]/40 bg-[var(--chat-paper)] px-4 text-[var(--chat-ink)] shadow-lg shadow-black/15 disabled:cursor-wait md:right-6 md:bottom-6"
          >
            <span className="relative inline-flex size-6 items-center justify-center">
              <span
                aria-hidden="true"
                className="cashier-glow absolute inset-0 rounded-full bg-[var(--chat-lamp)] blur-[6px]"
              />
              {busy ? (
                <Loader2 className="relative size-5 animate-spin" aria-hidden="true" />
              ) : (
                <MessageCircle
                  className="relative size-5 transition-transform duration-200 group-hover:-rotate-6"
                  aria-hidden="true"
                />
              )}
            </span>
            <span className="hidden font-hand text-lg leading-none md:inline">Catat cepat</span>
            <kbd className="hidden rounded border border-[var(--chat-wood)]/40 px-1.5 py-0.5 font-mono text-[10px] leading-none md:inline">
              N
            </kbd>
          </motion.button>
        )}
      </AnimatePresence>

      {data && (
        <QuickEntryDialog
          open={open}
          onOpenChange={handleOpenChange}
          accounts={data.accounts}
          categories={data.categories}
          suggestions={data.suggestions}
        />
      )}
    </>
  );
}
