import { describe, expect, it } from "vitest";
import { toFormData } from "@/lib/transaction-cashier/to-form-data";
import type { CompleteDraft } from "@/lib/transaction-cashier/flow";

const EXPENSE: CompleteDraft = {
  type: "EXPENSE",
  category: "Kopi",
  amount: 25_000,
  accountId: "bca",
  toAccountId: null,
  date: "2026-11-07",
  note: null,
};

describe("toFormData", () => {
  it("sends the same fields as the Add Transaction form", () => {
    const formData = toFormData({ ...EXPENSE, note: "Pagi" });
    expect(Object.fromEntries(formData)).toEqual({
      type: "EXPENSE",
      accountId: "bca",
      category: "Kopi",
      amount: "25000",
      date: "2026-11-07",
      note: "Pagi",
      affectsBalance: "on",
    });
  });

  it("omits note and toAccountId when absent so pickFormFields reads them as undefined", () => {
    const formData = toFormData(EXPENSE);
    expect(formData.has("note")).toBe(false);
    expect(formData.has("toAccountId")).toBe(false);
  });

  it("includes the destination account for a transfer", () => {
    const formData = toFormData({ ...EXPENSE, type: "TRANSFER", category: "Transfer", toAccountId: "cash" });
    expect(formData.get("toAccountId")).toBe("cash");
    expect(formData.get("category")).toBe("Transfer");
  });
});
