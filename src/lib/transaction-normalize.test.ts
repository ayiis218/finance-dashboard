import { describe, expect, it } from "vitest";
import { normalizeTransactionData } from "@/lib/transaction-normalize";

const BASE = {
  accountId: "acc-1",
  type: "EXPENSE" as const,
  category: "Makan",
  amount: 50_000,
  date: new Date("2026-01-01"),
  affectsBalance: true,
};

describe("normalizeTransactionData", () => {
  it("normalizes a cleared note to null, not undefined (regression)", () => {
    const result = normalizeTransactionData({ ...BASE, note: undefined });
    expect(result.note).toBeNull();
  });

  it("keeps a real note value as-is", () => {
    const result = normalizeTransactionData({ ...BASE, note: "Makan siang" });
    expect(result.note).toBe("Makan siang");
  });

  it("forces toAccountId to null for non-TRANSFER types even if one was submitted", () => {
    const result = normalizeTransactionData({ ...BASE, type: "EXPENSE", toAccountId: "acc-2" });
    expect(result.toAccountId).toBeNull();
  });

  it("throws when toAccountId equals accountId on a TRANSFER", () => {
    expect(() =>
      normalizeTransactionData({ ...BASE, type: "TRANSFER", toAccountId: "acc-1" }),
    ).toThrow();
  });
});
