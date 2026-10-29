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
  hasUnsavedProgress,
  toCompleteDraft,
  type ChatAction,
  type ChatState,
  type Draft,
  type FlowAccount,
  type FlowContext,
} from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";
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
  onProgressChange,
}: Readonly<{
  accounts: FlowAccount[];
  categories: string[];
  suggestions: TransactionSuggestions;
  onClose: () => void;
  /** Dikabari saat ada jawaban yang belum tercatat, supaya penutup dialog bisa meminta konfirmasi. */
  onProgressChange: (inProgress: boolean) => void;
}>) {
  const [today] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const ctx = useMemo<FlowContext>(
    () => ({ accounts, today, last: suggestions.last }),
    [accounts, today, suggestions.last],
  );
  const [state, dispatch] = useReducer(
    (current: ChatState, action: ChatAction) => chatReducer(current, action, ctx),
    ctx,
    createInitialState,
  );
  const [, startTransition] = useTransition();

  const inProgress = hasUnsavedProgress(state);
  useEffect(() => {
    onProgressChange(inProgress);
    return () => onProgressChange(false);
  }, [inProgress, onProgressChange]);

  function save(draft: Draft) {
    const complete = toCompleteDraft(draft);
    if (!complete) return;
    startTransition(async () => {
      try {
        await createTransaction(toFormData(complete));
        dispatch({ type: "saveSucceeded" });
      } catch {
        dispatch({ type: "saveFailed" });
      }
    });
  }

  function confirm() {
    dispatch({ type: "submit" });
    save(state.draft);
  }

  function retry() {
    dispatch({ type: "retry" });
    save(state.draft);
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
