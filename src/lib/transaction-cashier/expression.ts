import type { ChatState } from "@/lib/transaction-cashier/flow";

export type CashierExpression = "idle" | "greeting" | "thinking" | "happy" | "oops" | "confused";

/** Ekspresi kasir untuk keadaan percakapan saat ini. */
export function expressionFor(state: Pick<ChatState, "step" | "draft" | "savedCount">): CashierExpression {
  switch (state.step) {
    case "done":
      return "happy";
    case "saving":
      return "thinking";
    case "error":
      return "oops";
    case "blocked":
      return "confused";
    case "type":
      return state.savedCount === 0 && state.draft.type === undefined ? "greeting" : "idle";
    default:
      return "idle";
  }
}
