import type { Step } from "@/lib/transaction-cashier/flow";

export type CashierExpression = "idle" | "happy" | "thinking" | "oops";

/** Ekspresi kasir untuk tiap keadaan percakapan. */
export function expressionFor(step: Step): CashierExpression {
  switch (step) {
    case "done":
      return "happy";
    case "saving":
      return "thinking";
    case "error":
    case "blocked":
      return "oops";
    default:
      return "idle";
  }
}
