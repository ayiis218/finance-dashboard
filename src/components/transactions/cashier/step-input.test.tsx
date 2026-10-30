// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StepInput } from "@/components/transactions/cashier/step-input";
import { TAP_GUARD_MS } from "@/components/transactions/cashier/tap-guard";
import { createInitialState, type ChatState, type FlowContext } from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const LAST = { enteredAt: "2026-11-06T20:00:00", type: "EXPENSE" as const, category: "Kopi", amount: 25_000, accountId: "bca", toAccountId: null };
const CTX: FlowContext = {
  accounts: [
    { id: "bca", name: "BCA" },
    { id: "cash", name: "Cash" },
  ],
  sessionId: "session",
  today: "2026-11-07",
  last: LAST,
};
const SUGGESTIONS: TransactionSuggestions = {
  categoriesByType: { EXPENSE: [], INCOME: [], TRANSFER: [] },
  accountIds: [],
  last: LAST,
};

function renderStep(state: ChatState, dispatch = vi.fn()) {
  render(
    <StepInput
      state={state}
      ctx={CTX}
      categories={["Kopi"]}
      suggestions={SUGGESTIONS}
      dispatch={dispatch}
      onConfirm={vi.fn()}
      onRetry={vi.fn()}
      onClose={vi.fn()}
    />,
  );
  return dispatch;
}

const settle = () => act(() => void vi.advanceTimersByTime(TAP_GUARD_MS));

describe("StepInput: type step", () => {
  it("focuses the first transaction type, not the 'Ulangi' shortcut", () => {
    renderStep(createInitialState(CTX));
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Pengeluaran" }));
  });

  it("places the 'Ulangi' shortcut after the three types, outside the first grid cell", () => {
    renderStep(createInitialState(CTX));
    const labels = screen.getAllByRole("button").map((b) => b.textContent);
    expect(labels[0]).toBe("Pengeluaran");
    expect(labels.at(-1)).toMatch(/^Ulangi: Kopi .*25\.000 · kemarin$/);
  });

  it("ignores taps in the first moments, then repeats the last transaction on a deliberate tap", () => {
    const dispatch = renderStep(createInitialState(CTX));
    const repeat = screen.getByRole("button", { name: /Ulangi: Kopi/ });

    fireEvent.click(repeat);
    expect(dispatch).not.toHaveBeenCalled();

    settle();
    fireEvent.click(repeat);
    expect(dispatch).toHaveBeenCalledWith({ type: "repeatLast" });
  });

  it("does not select a transaction type from a tap that carried over from the previous step", () => {
    const dispatch = renderStep({ ...createInitialState(CTX), savedCount: 1 });
    fireEvent.click(screen.getByRole("button", { name: "Pengeluaran" }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("shows no shortcut when there is no previous transaction", () => {
    render(
      <StepInput
        state={createInitialState({ ...CTX, last: null })}
        ctx={{ ...CTX, last: null }}
        categories={[]}
        suggestions={{ ...SUGGESTIONS, last: null }}
        dispatch={vi.fn()}
        onConfirm={vi.fn()}
        onRetry={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: /Ulangi/ })).toBeNull();
  });
});

describe("StepInput: review step", () => {
  const review: ChatState = {
    ...createInitialState(CTX),
    step: "review",
    draft: { type: "EXPENSE", category: "Kopi", amount: 25_000, accountId: "bca", date: "2026-11-07", note: null },
    history: ["type"],
  };

  it("does not focus the 'Catat' button, so a held Enter cannot save the transaction", () => {
    renderStep(review);
    expect(document.activeElement).not.toBe(screen.getByRole("button", { name: "Catat" }));
    expect(document.activeElement).toBe(screen.getByRole("group", { name: "Ringkasan transaksi" }));
  });

  it("only saves when 'Catat' is pressed after the delay", () => {
    const onConfirm = vi.fn();
    render(
      <StepInput
        state={review}
        ctx={CTX}
        categories={[]}
        suggestions={SUGGESTIONS}
        dispatch={vi.fn()}
        onConfirm={onConfirm}
        onRetry={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Catat" }));
    expect(onConfirm).not.toHaveBeenCalled();
    settle();
    fireEvent.click(screen.getByRole("button", { name: "Catat" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});
