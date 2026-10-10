import { describe, expect, it } from "vitest";
import { normalizeRecurringData } from "@/lib/recurring-normalize";

const BASE = {
  accountId: "acc-1",
  type: "EXPENSE" as const,
  category: "Langganan",
  amount: 100_000,
  affectsBalance: true,
  frequency: "MONTHLY" as const,
  startDate: new Date("2026-01-01"),
};

describe("normalizeRecurringData", () => {
  it("normalizes a cleared note to null, not undefined (regression)", () => {
    const result = normalizeRecurringData({ ...BASE, note: undefined, endDate: undefined });
    expect(result.note).toBeNull();
  });

  it("normalizes a cleared endDate to null, not undefined (regression)", () => {
    const result = normalizeRecurringData({ ...BASE, note: undefined, endDate: undefined });
    expect(result.endDate).toBeNull();
  });

  it("keeps a real endDate value as-is", () => {
    const endDate = new Date("2026-12-01");
    const result = normalizeRecurringData({ ...BASE, note: undefined, endDate });
    expect(result.endDate).toBe(endDate);
  });

  it("throws when endDate is earlier than startDate", () => {
    expect(() =>
      normalizeRecurringData({ ...BASE, note: undefined, endDate: new Date("2025-01-01") }),
    ).toThrow();
  });

  it("forces toAccountId to null for non-TRANSFER types even if one was submitted", () => {
    const result = normalizeRecurringData({
      ...BASE,
      note: undefined,
      endDate: undefined,
      toAccountId: "acc-2",
    });
    expect(result.toAccountId).toBeNull();
  });
});
