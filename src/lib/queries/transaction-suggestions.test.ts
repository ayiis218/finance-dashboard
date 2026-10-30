import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const findMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/prisma", () => ({ prisma: { transaction: { findMany } } }));

import { getTransactionSuggestions } from "@/lib/queries/transaction-suggestions";

beforeEach(() => vi.resetAllMocks());
afterEach(() => vi.restoreAllMocks());

describe("getTransactionSuggestions", () => {
  it("builds suggestions from recent rows, converting Decimal amounts to numbers", async () => {
    findMany.mockResolvedValue([
      {
        type: "EXPENSE",
        category: "Kopi",
        accountId: "bca",
        toAccountId: null,
        amount: { toString: () => "25000", valueOf: () => 25000 },
        createdAt: new Date("2026-11-07T01:30:00.000Z"),
      },
    ]);
    const suggestions = await getTransactionSuggestions();
    expect(suggestions.categoriesByType.EXPENSE).toEqual(["Kopi"]);
    expect(suggestions.last).toMatchObject({ category: "Kopi", amount: 25_000, enteredAt: "2026-11-07T01:30:00.000Z" });
  });

  it("orders by when rows were entered, not by the transaction date, so 'Ulangi' offers what the user just keyed in", async () => {
    findMany.mockResolvedValue([]);
    await getTransactionSuggestions(new Date("2026-11-07T00:00:00.000Z"));
    const args = findMany.mock.calls[0][0];
    expect(args.orderBy).toEqual({ createdAt: "desc" });
    expect(args.where).toHaveProperty("createdAt");
    expect(args.where).not.toHaveProperty("date");
  });

  it("returns empty suggestions instead of throwing when the query fails, so the page render survives", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    findMany.mockRejectedValue(new Error("connection reset"));
    const suggestions = await getTransactionSuggestions();
    expect(suggestions).toEqual({
      categoriesByType: { EXPENSE: [], INCOME: [], TRANSFER: [] },
      accountIds: [],
      last: null,
    });
    expect(console.error).toHaveBeenCalled();
  });
});
