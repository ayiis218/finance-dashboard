import { describe, expect, it } from "vitest";
import {
  buildSuggestions,
  rankAccounts,
  rankOptions,
  splitVisible,
  type SuggestionRow,
} from "@/lib/transaction-cashier/suggestions";

function row(overrides: Partial<SuggestionRow>): SuggestionRow {
  return { type: "EXPENSE", category: "Makan", accountId: "bca", toAccountId: null, amount: 10_000, ...overrides };
}

describe("buildSuggestions", () => {
  it("returns empty suggestions without history", () => {
    expect(buildSuggestions([])).toEqual({
      categoriesByType: { EXPENSE: [], INCOME: [], TRANSFER: [] },
      accountIds: [],
      last: null,
    });
  });

  it("ranks categories per type by frequency", () => {
    const rows = [
      row({ category: "Kopi" }),
      row({ category: "Makan" }),
      row({ category: "Makan" }),
      row({ type: "INCOME", category: "Gaji" }),
    ];
    const { categoriesByType } = buildSuggestions(rows);
    expect(categoriesByType.EXPENSE).toEqual(["Makan", "Kopi"]);
    expect(categoriesByType.INCOME).toEqual(["Gaji"]);
  });

  it("breaks ties in favour of the more recent row", () => {
    const rows = [row({ category: "Bensin" }), row({ category: "Kopi" })];
    expect(buildSuggestions(rows).categoriesByType.EXPENSE).toEqual(["Bensin", "Kopi"]);
  });

  it("counts both sides of a transfer when ranking accounts", () => {
    const rows = [
      row({ type: "TRANSFER", accountId: "bca", toAccountId: "cash" }),
      row({ accountId: "cash" }),
      row({ accountId: "cash" }),
    ];
    expect(buildSuggestions(rows).accountIds).toEqual(["cash", "bca"]);
  });

  it("takes the first row as the last transaction", () => {
    const rows = [row({ category: "Kopi", amount: 25_000 }), row({ category: "Makan" })];
    expect(buildSuggestions(rows).last).toEqual({
      type: "EXPENSE",
      category: "Kopi",
      amount: 25_000,
      accountId: "bca",
      toAccountId: null,
    });
  });
});

describe("rankOptions", () => {
  it("puts preferred options first and keeps the rest in their original order", () => {
    expect(rankOptions(["a", "b", "c", "d"], ["c", "a"])).toEqual(["c", "a", "b", "d"]);
  });

  it("ignores preferred options that no longer exist", () => {
    expect(rankOptions(["a", "b"], ["gone", "b"])).toEqual(["b", "a"]);
  });
});

describe("rankAccounts", () => {
  const accounts = [
    { id: "a", name: "A" },
    { id: "b", name: "B" },
    { id: "c", name: "C" },
  ];

  it("puts frequently used accounts first", () => {
    expect(rankAccounts(accounts, ["c", "gone"]).map((a) => a.id)).toEqual(["c", "a", "b"]);
  });
});

describe("splitVisible", () => {
  it("splits at the limit", () => {
    expect(splitVisible([1, 2, 3, 4], 2)).toEqual({ visible: [1, 2], hidden: [3, 4] });
  });

  it("shows everything when under the limit", () => {
    expect(splitVisible([1, 2], 6)).toEqual({ visible: [1, 2], hidden: [] });
  });
});
