import { describe, expect, it } from "vitest";
import {
  MAX_AMOUNT,
  canGoBack,
  chatReducer,
  createInitialState,
  isIsoDate,
  quickDates,
  stepsFor,
  toCompleteDraft,
  type ChatAction,
  type ChatState,
  type FlowContext,
} from "@/lib/transaction-cashier/flow";

const BCA = { id: "bca", name: "BCA" };
const CASH = { id: "cash", name: "Cash" };

const CTX: FlowContext = { accounts: [BCA, CASH], today: "2026-11-07", last: null };
const SINGLE_CTX: FlowContext = { ...CTX, accounts: [BCA] };

function run(ctx: FlowContext, actions: ChatAction[], from?: ChatState): ChatState {
  return actions.reduce((state, action) => chatReducer(state, action, ctx), from ?? createInitialState(ctx));
}

const EXPENSE_TO_REVIEW: ChatAction[] = [
  { type: "pickType", value: "EXPENSE" },
  { type: "pickCategory", value: "Kopi" },
  { type: "setAmount", value: 25_000 },
  { type: "pickAccount", id: "bca" },
  { type: "pickDate", value: "2026-11-07" },
  { type: "setNote", value: null },
];

describe("createInitialState", () => {
  it("starts at the type question when accounts exist", () => {
    expect(createInitialState(CTX).step).toBe("type");
  });

  it("is blocked when there are no accounts", () => {
    expect(createInitialState({ ...CTX, accounts: [] }).step).toBe("blocked");
  });
});

describe("stepsFor", () => {
  it("lists the expense and income path with an account question", () => {
    expect(stepsFor("EXPENSE", CTX)).toEqual(["category", "amount", "account", "date", "note", "review"]);
    expect(stepsFor("INCOME", CTX)).toEqual(["category", "amount", "account", "date", "note", "review"]);
  });

  it("lists the transfer path with source and destination, without a category", () => {
    expect(stepsFor("TRANSFER", CTX)).toEqual(["account", "toAccount", "amount", "date", "note", "review"]);
  });

  it("skips the account question when only one account exists", () => {
    expect(stepsFor("EXPENSE", SINGLE_CTX)).toEqual(["category", "amount", "date", "note", "review"]);
  });
});

describe("expense flow", () => {
  it("walks every question in order and ends on review with a complete draft", () => {
    const steps: string[] = [];
    let state = createInitialState(CTX);
    for (const action of EXPENSE_TO_REVIEW) {
      state = chatReducer(state, action, CTX);
      steps.push(state.step);
    }
    expect(steps).toEqual(["category", "amount", "account", "date", "note", "review"]);
    expect(toCompleteDraft(state.draft)).toEqual({
      type: "EXPENSE",
      category: "Kopi",
      amount: 25_000,
      accountId: "bca",
      toAccountId: null,
      date: "2026-11-07",
      note: null,
    });
  });

  it("autofills the account and skips its question with a single account", () => {
    const state = run(SINGLE_CTX, [
      { type: "pickType", value: "EXPENSE" },
      { type: "pickCategory", value: "Kopi" },
      { type: "setAmount", value: 25_000 },
    ]);
    expect(state.step).toBe("date");
    expect(state.draft.accountId).toBe("bca");
  });
});

describe("income flow", () => {
  it("asks for the source category and destination account", () => {
    const state = run(CTX, [
      { type: "pickType", value: "INCOME" },
      { type: "pickCategory", value: "Gaji" },
      { type: "setAmount", value: 5_000_000 },
      { type: "pickAccount", id: "cash" },
      { type: "pickDate", value: "2026-11-01" },
      { type: "setNote", value: "  November  " },
    ]);
    expect(state.step).toBe("review");
    expect(toCompleteDraft(state.draft)).toMatchObject({ type: "INCOME", category: "Gaji", accountId: "cash", note: "November" });
  });
});

describe("transfer flow", () => {
  const TRANSFER_TO_REVIEW: ChatAction[] = [
    { type: "pickType", value: "TRANSFER" },
    { type: "pickAccount", id: "bca" },
    { type: "pickToAccount", id: "cash" },
    { type: "setAmount", value: 100_000 },
    { type: "pickDate", value: "2026-11-07" },
    { type: "setNote", value: null },
  ];

  it("reaches review and records a fixed Transfer category", () => {
    const state = run(CTX, TRANSFER_TO_REVIEW);
    expect(state.step).toBe("review");
    expect(toCompleteDraft(state.draft)).toMatchObject({
      type: "TRANSFER",
      category: "Transfer",
      accountId: "bca",
      toAccountId: "cash",
    });
  });

  it("rejects a destination equal to the source", () => {
    const state = run(CTX, [
      { type: "pickType", value: "TRANSFER" },
      { type: "pickAccount", id: "bca" },
      { type: "pickToAccount", id: "bca" },
    ]);
    expect(state.step).toBe("toAccount");
    expect(state.draft.toAccountId).toBeUndefined();
  });

  it("stays on the type question with a notice when fewer than two accounts exist", () => {
    const state = run(SINGLE_CTX, [{ type: "pickType", value: "TRANSFER" }]);
    expect(state.step).toBe("type");
    expect(state.notice).toBe("transfer-needs-two-accounts");
  });
});

describe("back", () => {
  it("returns to the previous step and keeps earlier answers", () => {
    const state = run(CTX, [
      { type: "pickType", value: "EXPENSE" },
      { type: "pickCategory", value: "Kopi" },
      { type: "back" },
    ]);
    expect(state.step).toBe("category");
    expect(state.draft.category).toBe("Kopi");
  });

  it("does nothing on the first question", () => {
    const state = run(CTX, [{ type: "back" }]);
    expect(state).toEqual(createInitialState(CTX));
  });

  it("is blocked while saving and after saving, so a record cannot be saved twice", () => {
    const saving = run(CTX, [...EXPENSE_TO_REVIEW, { type: "submit" }]);
    expect(canGoBack(saving)).toBe(false);
    expect(chatReducer(saving, { type: "back" }, CTX)).toBe(saving);

    const done = chatReducer(saving, { type: "saveSucceeded" }, CTX);
    expect(chatReducer(done, { type: "back" }, CTX)).toBe(done);
  });

  it("returns from the error step to review", () => {
    const state = run(CTX, [...EXPENSE_TO_REVIEW, { type: "submit" }, { type: "saveFailed" }, { type: "back" }]);
    expect(state.step).toBe("review");
  });
});

describe("edit from review", () => {
  it("jumps to the chosen question and returns straight to review after answering", () => {
    const state = run(CTX, [...EXPENSE_TO_REVIEW, { type: "edit", step: "amount" }, { type: "setAmount", value: 30_000 }]);
    expect(state.step).toBe("review");
    expect(state.draft.amount).toBe(30_000);
    expect(state.returnToReview).toBe(false);
  });

  it("goes back to review, not to the previous question, from an edited step", () => {
    const state = run(CTX, [...EXPENSE_TO_REVIEW, { type: "edit", step: "category" }, { type: "back" }]);
    expect(state.step).toBe("review");
  });

  it("asks for the destination again when the source is changed to the old destination", () => {
    const state = run(CTX, [
      { type: "pickType", value: "TRANSFER" },
      { type: "pickAccount", id: "bca" },
      { type: "pickToAccount", id: "cash" },
      { type: "setAmount", value: 100_000 },
      { type: "pickDate", value: "2026-11-07" },
      { type: "setNote", value: null },
      { type: "edit", step: "account" },
      { type: "pickAccount", id: "cash" },
    ]);
    expect(state.step).toBe("toAccount");
    expect(chatReducer(state, { type: "pickToAccount", id: "bca" }, CTX).step).toBe("review");
  });

  it("refuses to edit a question that is not part of the path", () => {
    const review = run(SINGLE_CTX, [
      { type: "pickType", value: "EXPENSE" },
      { type: "pickCategory", value: "Kopi" },
      { type: "setAmount", value: 25_000 },
      { type: "pickDate", value: "2026-11-07" },
      { type: "setNote", value: null },
    ]);
    expect(review.step).toBe("review");
    expect(chatReducer(review, { type: "edit", step: "account" }, SINGLE_CTX)).toBe(review);
  });
});

describe("input validation", () => {
  const atAmount = () =>
    run(CTX, [
      { type: "pickType", value: "EXPENSE" },
      { type: "pickCategory", value: "Kopi" },
    ]);

  it.each([0, -5, 1.5, Number.NaN, MAX_AMOUNT + 1])("ignores the invalid amount %s", (value) => {
    const state = atAmount();
    expect(chatReducer(state, { type: "setAmount", value }, CTX)).toBe(state);
  });

  it("accepts the largest allowed amount", () => {
    expect(chatReducer(atAmount(), { type: "setAmount", value: MAX_AMOUNT }, CTX).step).toBe("account");
  });

  it("ignores a blank category", () => {
    const state = run(CTX, [{ type: "pickType", value: "EXPENSE" }]);
    expect(chatReducer(state, { type: "pickCategory", value: "   " }, CTX)).toBe(state);
  });

  it("ignores an unknown account", () => {
    const state = run(CTX, [
      { type: "pickType", value: "EXPENSE" },
      { type: "pickCategory", value: "Kopi" },
      { type: "setAmount", value: 1000 },
    ]);
    expect(chatReducer(state, { type: "pickAccount", id: "nope" }, CTX)).toBe(state);
  });

  it("ignores an answer given for a step that is not current", () => {
    const state = createInitialState(CTX);
    expect(chatReducer(state, { type: "setAmount", value: 1000 }, CTX)).toBe(state);
  });

  it("ignores submit until the draft is complete", () => {
    const state = run(CTX, [{ type: "pickType", value: "EXPENSE" }]);
    expect(chatReducer(state, { type: "submit" }, CTX)).toBe(state);
  });
});

describe("changing the transaction type", () => {
  it("drops the category and destination from the previous type", () => {
    const state = run(CTX, [
      { type: "pickType", value: "EXPENSE" },
      { type: "pickCategory", value: "Kopi" },
      { type: "back" },
      { type: "back" },
      { type: "pickType", value: "INCOME" },
    ]);
    expect(state.step).toBe("category");
    expect(state.draft.type).toBe("INCOME");
    expect(state.draft.category).toBeUndefined();
  });
});

describe("saving", () => {
  it("moves review -> saving -> done and counts the saved transaction", () => {
    const saving = run(CTX, [...EXPENSE_TO_REVIEW, { type: "submit" }]);
    expect(saving.step).toBe("saving");
    const done = chatReducer(saving, { type: "saveSucceeded" }, CTX);
    expect(done).toMatchObject({ step: "done", savedCount: 1 });
  });

  it("allows retrying after a failure", () => {
    const state = run(CTX, [...EXPENSE_TO_REVIEW, { type: "submit" }, { type: "saveFailed" }, { type: "retry" }]);
    expect(state.step).toBe("saving");
  });

  it("starts over keeping the account, date and saved count", () => {
    const state = run(CTX, [...EXPENSE_TO_REVIEW, { type: "submit" }, { type: "saveSucceeded" }, { type: "startOver" }]);
    expect(state).toMatchObject({
      step: "type",
      savedCount: 1,
      history: [],
      draft: { accountId: "bca", date: "2026-11-07" },
    });
  });

  it("ignores save results outside the saving step", () => {
    const state = createInitialState(CTX);
    expect(chatReducer(state, { type: "saveSucceeded" }, CTX)).toBe(state);
    expect(chatReducer(state, { type: "saveFailed" }, CTX)).toBe(state);
  });
});

describe("repeatLast", () => {
  const last = { type: "EXPENSE" as const, category: "Kopi", amount: 25_000, accountId: "bca", toAccountId: null };

  it("jumps to review with today's date and no note", () => {
    const ctx = { ...CTX, last };
    const state = run(ctx, [{ type: "repeatLast" }]);
    expect(state.step).toBe("review");
    expect(toCompleteDraft(state.draft)).toEqual({ ...last, date: "2026-11-07", note: null });
  });

  it("does nothing without a last transaction", () => {
    const state = createInitialState(CTX);
    expect(chatReducer(state, { type: "repeatLast" }, CTX)).toBe(state);
  });

  it("does nothing when the last account no longer exists", () => {
    const ctx = { ...CTX, last: { ...last, accountId: "deleted" } };
    const state = createInitialState(ctx);
    expect(chatReducer(state, { type: "repeatLast" }, ctx)).toBe(state);
  });
});

describe("date helpers", () => {
  it("offers today and yesterday", () => {
    expect(quickDates("2026-03-01")).toEqual([
      { label: "Hari ini", value: "2026-03-01" },
      { label: "Kemarin", value: "2026-02-28" },
    ]);
  });

  it.each([
    ["2026-11-07", true],
    ["2026-02-30", false],
    ["07-11-2026", false],
    ["", false],
  ])("isIsoDate(%j) is %s", (value, expected) => {
    expect(isIsoDate(value)).toBe(expected);
  });
});
