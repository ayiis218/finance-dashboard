import { describe, expect, it } from "vitest";
import { answerLabel, collectedAnswers, promptFor, repeatLabel, reviewLines } from "@/lib/transaction-cashier/copy";
import {
  chatReducer,
  createInitialState,
  type ChatAction,
  type FlowContext,
} from "@/lib/transaction-cashier/flow";

const CTX: FlowContext = {
  accounts: [
    { id: "bca", name: "BCA" },
    { id: "cash", name: "Cash" },
  ],
  today: "2026-11-07",
  last: null,
};

function run(actions: ChatAction[], ctx: FlowContext = CTX) {
  return actions.reduce((state, action) => chatReducer(state, action, ctx), createInitialState(ctx));
}

const EXPENSE: ChatAction[] = [
  { type: "pickType", value: "EXPENSE" },
  { type: "pickCategory", value: "Kopi" },
  { type: "setAmount", value: 25_000 },
  { type: "pickAccount", id: "bca" },
  { type: "pickDate", value: "2026-11-06" },
];

describe("promptFor", () => {
  it("greets on the first question and acknowledges later ones", () => {
    expect(promptFor(createInitialState(CTX))).toBe("Halo! Mau catat apa hari ini?");
    const again = run([...EXPENSE, { type: "setNote", value: null }, { type: "submit" }, { type: "saveSucceeded" }, { type: "startOver" }]);
    expect(promptFor(again)).toBe("Oke, lanjut! Mau catat apa lagi?");
  });

  it("words the question by transaction type", () => {
    expect(promptFor(run([{ type: "pickType", value: "EXPENSE" }]))).toBe("Oke, belanja apa nih?");
    expect(promptFor(run([{ type: "pickType", value: "INCOME" }]))).toBe("Pemasukan dari mana nih?");
    expect(promptFor(run([{ type: "pickType", value: "TRANSFER" }]))).toBe("Transfer dari rekening mana?");
  });

  it("uses an edit prompt when changing one answer from review", () => {
    const state = run([...EXPENSE, { type: "setNote", value: null }, { type: "edit", step: "amount" }]);
    expect(promptFor(state)).toBe("Jumlahnya jadi berapa?");
  });


  it("tells the user to add an account when none exist", () => {
    expect(promptFor(createInitialState({ ...CTX, accounts: [] }))).toContain("Belum ada rekening");
  });
});

describe("answerLabel", () => {
  it("formats each answer for display", () => {
    const { draft } = run([...EXPENSE, { type: "setNote", value: "Pagi" }]);
    expect(answerLabel("type", draft, CTX)).toBe("Pengeluaran");
    expect(answerLabel("category", draft, CTX)).toBe("Kopi");
    expect(answerLabel("amount", draft, CTX)).toMatch(/25\.000/);
    expect(answerLabel("account", draft, CTX)).toBe("BCA");
    expect(answerLabel("date", draft, CTX)).toBe("Kemarin");
    expect(answerLabel("note", draft, CTX)).toBe("Pagi");
  });

  it("labels today and an arbitrary date", () => {
    expect(answerLabel("date", { date: "2026-11-07" }, CTX)).toBe("Hari ini");
    expect(answerLabel("date", { date: "2026-01-05" }, CTX)).toBe("5 Januari 2026");
  });

  it("returns undefined for an unanswered step and says 'Tanpa catatan' for a skipped note", () => {
    expect(answerLabel("amount", {}, CTX)).toBeUndefined();
    expect(answerLabel("note", { note: null }, CTX)).toBe("Tanpa catatan");
  });
});

describe("reviewLines", () => {
  it("lists the expense receipt and marks which lines can be edited", () => {
    const { draft } = run([...EXPENSE, { type: "setNote", value: null }]);
    const lines = reviewLines(draft, CTX);
    expect(lines.map((l) => l.label)).toEqual(["Jenis", "Kategori", "Jumlah", "Dibayar dari", "Tanggal", "Catatan"]);
    expect(lines[0].editStep).toBeNull();
    expect(lines[1].editStep).toBe("category");
  });

  it("shows source and destination for a transfer and no category", () => {
    const { draft } = run([
      { type: "pickType", value: "TRANSFER" },
      { type: "pickAccount", id: "bca" },
      { type: "pickToAccount", id: "cash" },
      { type: "setAmount", value: 100_000 },
      { type: "pickDate", value: "2026-11-07" },
      { type: "setNote", value: null },
    ]);
    const labels = reviewLines(draft, CTX).map((l) => l.label);
    expect(labels).toEqual(["Jenis", "Jumlah", "Dari rekening", "Ke rekening", "Tanggal", "Catatan"]);
  });

  it("does not offer editing the account when it was filled automatically", () => {
    const single = { ...CTX, accounts: [CTX.accounts[0]] };
    const { draft } = run(
      [
        { type: "pickType", value: "EXPENSE" },
        { type: "pickCategory", value: "Kopi" },
        { type: "setAmount", value: 1000 },
        { type: "pickDate", value: "2026-11-07" },
        { type: "setNote", value: null },
      ],
      single,
    );
    const account = reviewLines(draft, single).find((l) => l.label === "Dibayar dari");
    expect(account).toMatchObject({ value: "BCA", editStep: null });
  });
});

describe("transfer wording", () => {
  const TRANSFER: ChatAction[] = [
    { type: "pickType", value: "TRANSFER" },
    { type: "pickAccount", id: "bca" },
    { type: "pickToAccount", id: "cash" },
  ];

  it("shows the direction in the answer chips", () => {
    const state = run(TRANSFER);
    expect(state.step).toBe("amount");
    expect(collectedAnswers(state, CTX)).toEqual(["Transfer", "Dari BCA", "Ke Cash"]);
  });

  it("labels an external destination in chips and on the receipt", () => {
    const state = run([...TRANSFER.slice(0, 2), { type: "pickToAccount", id: null }]);
    expect(collectedAnswers(state, CTX)).toEqual(["Transfer", "Dari BCA", "Ke luar sistem"]);
    expect(answerLabel("toAccount", state.draft, CTX)).toBe("Di luar sistem");
  });

  it("does not label an unanswered destination", () => {
    expect(answerLabel("toAccount", {}, CTX)).toBeUndefined();
  });
});

describe("collectedAnswers", () => {
  it("is empty before a type is chosen", () => {
    expect(collectedAnswers(createInitialState(CTX), CTX)).toEqual([]);
  });

  it("lists answers given so far, excluding the current question", () => {
    const state = run(EXPENSE.slice(0, 3));
    expect(state.step).toBe("account");
    const answers = collectedAnswers(state, CTX);
    expect(answers[0]).toBe("Pengeluaran");
    expect(answers[1]).toBe("Kopi");
    expect(answers[2]).toMatch(/25\.000/);
    expect(answers).toHaveLength(3);
  });
});

describe("repeatLabel", () => {
  it("names the category and amount for an expense", () => {
    const last = { type: "EXPENSE" as const, category: "Kopi", amount: 25_000, accountId: "bca", toAccountId: null };
    expect(repeatLabel(last)).toMatch(/^Ulangi: Kopi .*25\.000/);
  });

  it("masks the historical amount in privacy mode", () => {
    const last = { type: "EXPENSE" as const, category: "Kopi", amount: 25_000, accountId: "bca", toAccountId: null };
    expect(repeatLabel(last, { maskAmount: true })).toBe("Ulangi: Kopi ••••••");
    expect(repeatLabel({ ...last, type: "TRANSFER" }, { maskAmount: true })).toBe("Ulangi transfer ••••••");
  });

  it("omits the category for a transfer", () => {
    const last = { type: "TRANSFER" as const, category: "Transfer", amount: 100_000, accountId: "bca", toAccountId: "cash" };
    expect(repeatLabel(last)).toMatch(/^Ulangi transfer .*100\.000/);
  });
});
