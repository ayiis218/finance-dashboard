"use client";

import { useEffect, useMemo, useReducer, useState, useTransition } from "react";
import { MotionConfig } from "motion/react";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CashierStage } from "@/components/transactions/cashier/cashier-stage";
import { StepInput } from "@/components/transactions/cashier/step-input";
import { createTransaction } from "@/lib/actions/transactions";
import {
  canGoBack,
  chatReducer,
  createInitialState,
  closeGuard,
  toCompleteDraft,
  type ChatAction,
  type ChatState,
  type CloseGuard,
  type Draft,
  type FlowAccount,
  type FlowContext,
} from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";
import { createSessionId, requestIdFor } from "@/lib/transaction-cashier/request-id";
import { toFormData } from "@/lib/transaction-cashier/to-form-data";

/**
 * Kontainer "Catat cepat": memegang state percakapan (reducer murni di `lib/`)
 * dan memanggil `createTransaction` yang sama dengan form lama saat user
 * menekan "Catat". Komponen lain hanya merender state dan meneruskan aksi.
 */
export function CashierFlow({
  accounts,
  categories,
  suggestions,
  onClose,
  onCloseGuardChange,
}: Readonly<{
  accounts: FlowAccount[];
  categories: string[];
  suggestions: TransactionSuggestions;
  onClose: () => void;
  /** Dikabari seberapa hati-hati dialog harus ditutup, supaya penutup dialog bisa meminta konfirmasi. */
  onCloseGuardChange: (guard: CloseGuard) => void;
}>) {
  const [today] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [sessionId] = useState(createSessionId);
  const ctx = useMemo<FlowContext>(
    () => ({ accounts, sessionId, today, last: suggestions.last }),
    [accounts, sessionId, today, suggestions.last],
  );
  const [state, dispatch] = useReducer(
    (current: ChatState, action: ChatAction) => chatReducer(current, action, ctx),
    ctx,
    createInitialState,
  );
  const [, startTransition] = useTransition();

  const guard = closeGuard(state);
  useEffect(() => {
    onCloseGuardChange(guard);
    return () => onCloseGuardChange("free");
  }, [guard, onCloseGuardChange]);

  // Id yang sama untuk draft yang sama: "Coba lagi" tidak membuat transaksi kedua bila percobaan
  // pertama ternyata sudah tersimpan (server menolak id kembar dan menganggapnya sukses).
  function save(draft: Draft, requestId: string) {
    const complete = toCompleteDraft(draft);
    if (!complete) return;
    startTransition(async () => {
      try {
        await createTransaction(toFormData(complete, requestId));
        dispatch({ type: "saveSucceeded" });
      } catch {
        dispatch({ type: "saveFailed" });
      }
    });
  }

  function confirm() {
    if (state.step !== "review") return;
    dispatch({ type: "submit" });
    save(state.draft, requestIdFor(sessionId, state.revision));
  }

  function retry() {
    if (state.step !== "error") return;
    dispatch({ type: "retry" });
    save(state.draft, requestIdFor(sessionId, state.revision));
  }

  return (
    // reducedMotion="user": semua animasi motion mengikuti preferensi sistem.
    <MotionConfig reducedMotion="user">
      <div className="cashier-scene space-y-4">
        <CashierStage state={state} ctx={ctx} />
        <StepInput
          // Remount tiap langkah supaya fokus dan state lokal input (keypad, catatan) mulai bersih.
          key={`${state.step}-${state.history.length}`}
          state={state}
          ctx={ctx}
          categories={categories}
          suggestions={suggestions}
          dispatch={dispatch}
          onConfirm={confirm}
          onRetry={retry}
          onClose={onClose}
        />
        {canGoBack(state) && (
          <Button type="button" variant="ghost" size="sm" className="h-9" onClick={() => dispatch({ type: "back" })}>
            <ArrowLeft className="size-4" aria-hidden="true" />
            Kembali
          </Button>
        )}
      </div>
    </MotionConfig>
  );
}
