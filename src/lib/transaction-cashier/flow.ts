import { format, isValid, parseISO, subDays } from "date-fns";

/**
 * State machine murni untuk chat "Catat cepat" — tanpa React, tanpa DB, tanpa
 * `Date.now()` (hari ini selalu masuk lewat `FlowContext.today`), supaya semua
 * jalur percakapan bisa dites sebagai fungsi biasa. Teks yang tampil ke user
 * ada di `copy.ts`; komponen UI cuma merender `ChatState` dan meneruskan aksi.
 */

export type TransactionKind = "EXPENSE" | "INCOME" | "TRANSFER";

export type FlowAccount = { id: string; name: string };

export type LastTransaction = {
  type: TransactionKind;
  category: string;
  amount: number;
  accountId: string;
  toAccountId: string | null;
};

export type FlowContext = {
  accounts: FlowAccount[];
  /** Tanggal lokal user, format yyyy-MM-dd. */
  today: string;
  last: LastTransaction | null;
};

export type QuestionStep = "type" | "category" | "amount" | "account" | "toAccount" | "date" | "note";
export type EditableStep = Exclude<QuestionStep, "type">;
export type Step = QuestionStep | "review" | "saving" | "done" | "error" | "blocked";

export type Draft = {
  type?: TransactionKind;
  category?: string;
  amount?: number;
  accountId?: string;
  toAccountId?: string;
  date?: string;
  /** `null` = user sengaja melewati catatan; `undefined` = belum ditanya. */
  note?: string | null;
};

export type CompleteDraft = {
  type: TransactionKind;
  category: string;
  amount: number;
  accountId: string;
  toAccountId: string | null;
  date: string;
  note: string | null;
};

export type Notice = "transfer-needs-two-accounts";

export type ChatState = {
  step: Step;
  draft: Draft;
  /** Langkah-langkah yang sudah dilewati, untuk tombol Kembali dan transkrip percakapan. */
  history: Step[];
  /** True saat user lompat dari ringkasan untuk mengubah satu jawaban. */
  returnToReview: boolean;
  notice: Notice | null;
  savedCount: number;
};

export type ChatAction =
  | { type: "pickType"; value: TransactionKind }
  | { type: "repeatLast" }
  | { type: "pickCategory"; value: string }
  | { type: "setAmount"; value: number }
  | { type: "pickAccount"; id: string }
  | { type: "pickToAccount"; id: string }
  | { type: "pickDate"; value: string }
  | { type: "setNote"; value: string | null }
  | { type: "edit"; step: EditableStep }
  | { type: "back" }
  | { type: "submit" }
  | { type: "saveSucceeded" }
  | { type: "saveFailed" }
  | { type: "retry" }
  | { type: "startOver" };

/** Transfer tidak ditanya kategorinya; dicatat dengan kategori tetap ini. */
export const TRANSFER_CATEGORY = "Transfer";
export const MAX_AMOUNT = 999_999_999_999;
export const QUICK_AMOUNTS = [10_000, 25_000, 50_000, 100_000, 250_000] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const NOT_REVERSIBLE: readonly Step[] = ["saving", "done", "blocked"];

export function isIsoDate(value: string): boolean {
  return ISO_DATE.test(value) && isValid(parseISO(value));
}

export function quickDates(today: string): { label: string; value: string }[] {
  return [
    { label: "Hari ini", value: today },
    { label: "Kemarin", value: format(subDays(parseISO(today), 1), "yyyy-MM-dd") },
  ];
}

/** Urutan pertanyaan setelah jenis transaksi dipilih. */
export function stepsFor(type: TransactionKind, ctx: FlowContext): Step[] {
  if (type === "TRANSFER") return ["account", "toAccount", "amount", "date", "note", "review"];
  const account: Step[] = ctx.accounts.length === 1 ? [] : ["account"];
  return ["category", "amount", ...account, "date", "note", "review"];
}

const IS_ANSWERED: Record<QuestionStep, (draft: Draft) => boolean> = {
  type: (d) => d.type !== undefined,
  category: (d) => Boolean(d.category),
  amount: (d) => d.amount !== undefined,
  account: (d) => Boolean(d.accountId),
  toAccount: (d) => Boolean(d.toAccountId),
  date: (d) => Boolean(d.date),
  note: (d) => d.note !== undefined,
};

export function isQuestionStep(step: Step): step is QuestionStep {
  return step in IS_ANSWERED;
}

export function isAnswered(step: QuestionStep, draft: Draft): boolean {
  return IS_ANSWERED[step](draft);
}

export function toCompleteDraft(draft: Draft): CompleteDraft | null {
  const { type, amount, accountId, date } = draft;
  if (!type || amount === undefined || !accountId || !date) return null;
  const note = draft.note ?? null;

  if (type === "TRANSFER") {
    if (!draft.toAccountId) return null;
    return { type, category: TRANSFER_CATEGORY, amount, accountId, toAccountId: draft.toAccountId, date, note };
  }
  if (!draft.category) return null;
  return { type, category: draft.category, amount, accountId, toAccountId: null, date, note };
}

export function canGoBack(state: ChatState): boolean {
  return state.history.length > 0 && !NOT_REVERSIBLE.includes(state.step);
}

export function createInitialState(ctx: FlowContext): ChatState {
  return {
    step: ctx.accounts.length === 0 ? "blocked" : "type",
    draft: {},
    history: [],
    returnToReview: false,
    notice: null,
    savedCount: 0,
  };
}

function hasAccount(ctx: FlowContext, id: string): boolean {
  return ctx.accounts.some((a) => a.id === id);
}

function moveTo(state: ChatState, step: Step, draft: Draft): ChatState {
  return { ...state, draft, step, history: [...state.history, state.step], notice: null };
}

function backToReview(state: ChatState, draft: Draft): ChatState {
  const reviewIndex = state.history.lastIndexOf("review");
  const history = reviewIndex >= 0 ? state.history.slice(0, reviewIndex) : state.history;
  return { ...state, draft, step: "review", history, returnToReview: false, notice: null };
}

function firstMissingStep(draft: Draft, ctx: FlowContext): QuestionStep | null {
  if (!draft.type) return null;
  const missing = stepsFor(draft.type, ctx).find((s) => isQuestionStep(s) && !isAnswered(s, draft));
  return missing && isQuestionStep(missing) ? missing : null;
}

/** Maju ke pertanyaan berikutnya, atau balik ke ringkasan bila sedang mengubah satu jawaban. */
function advance(state: ChatState, draft: Draft, ctx: FlowContext): ChatState {
  if (state.returnToReview) {
    const missing = firstMissingStep(draft, ctx);
    return missing ? moveTo(state, missing, draft) : backToReview(state, draft);
  }
  const steps = stepsFor(draft.type!, ctx);
  const next = steps[steps.indexOf(state.step) + 1] ?? "review";
  return moveTo(state, next, draft);
}

function answer(state: ChatState, ctx: FlowContext, step: Step, patch: Partial<Draft>): ChatState {
  if (state.step !== step) return state;
  return advance(state, { ...state.draft, ...patch }, ctx);
}

function withAutoAccount(draft: Draft, ctx: FlowContext): Draft {
  if (draft.type === "TRANSFER" || ctx.accounts.length !== 1) return draft;
  return { ...draft, accountId: ctx.accounts[0].id };
}

function pickType(state: ChatState, ctx: FlowContext, value: TransactionKind): ChatState {
  if (state.step !== "type") return state;
  if (value === "TRANSFER" && ctx.accounts.length < 2) {
    return { ...state, notice: "transfer-needs-two-accounts" };
  }
  const changed = state.draft.type !== value;
  const base: Draft = changed
    ? { ...state.draft, type: value, category: undefined, toAccountId: undefined }
    : { ...state.draft, type: value };
  const draft = withAutoAccount(base, ctx);
  return moveTo(state, stepsFor(value, ctx)[0], draft);
}

function repeatLast(state: ChatState, ctx: FlowContext): ChatState {
  const { last } = ctx;
  if (state.step !== "type" || !last || !hasAccount(ctx, last.accountId)) return state;
  if (last.type === "TRANSFER") {
    const validTarget = last.toAccountId !== null && hasAccount(ctx, last.toAccountId);
    if (!validTarget || last.toAccountId === last.accountId) return state;
  }
  const draft: Draft = {
    type: last.type,
    category: last.category,
    amount: last.amount,
    accountId: last.accountId,
    toAccountId: last.toAccountId ?? undefined,
    date: ctx.today,
    note: null,
  };
  return moveTo(state, "review", draft);
}

function pickCategory(state: ChatState, ctx: FlowContext, value: string): ChatState {
  const category = value.trim();
  return category ? answer(state, ctx, "category", { category }) : state;
}

function setAmount(state: ChatState, ctx: FlowContext, value: number): ChatState {
  const valid = Number.isInteger(value) && value > 0 && value <= MAX_AMOUNT;
  return valid ? answer(state, ctx, "amount", { amount: value }) : state;
}

function pickAccount(state: ChatState, ctx: FlowContext, id: string): ChatState {
  if (!hasAccount(ctx, id)) return state;
  const toAccountId = state.draft.toAccountId === id ? undefined : state.draft.toAccountId;
  return answer(state, ctx, "account", { accountId: id, toAccountId });
}

function pickToAccount(state: ChatState, ctx: FlowContext, id: string): ChatState {
  if (!hasAccount(ctx, id) || id === state.draft.accountId) return state;
  return answer(state, ctx, "toAccount", { toAccountId: id });
}

function pickDate(state: ChatState, ctx: FlowContext, value: string): ChatState {
  return isIsoDate(value) ? answer(state, ctx, "date", { date: value }) : state;
}

function setNote(state: ChatState, ctx: FlowContext, value: string | null): ChatState {
  const note = value?.trim() || null;
  return answer(state, ctx, "note", { note });
}

function edit(state: ChatState, ctx: FlowContext, step: EditableStep): ChatState {
  const { type } = state.draft;
  if (state.step !== "review" || !type || !stepsFor(type, ctx).includes(step)) return state;
  return { ...moveTo(state, step, state.draft), returnToReview: true };
}

function back(state: ChatState): ChatState {
  if (!canGoBack(state)) return state;
  const step = state.history[state.history.length - 1];
  return { ...state, step, history: state.history.slice(0, -1), returnToReview: false, notice: null };
}

function submit(state: ChatState): ChatState {
  if (state.step !== "review" || !toCompleteDraft(state.draft)) return state;
  return { ...state, step: "saving", history: [...state.history, "review"] };
}

function startOver(state: ChatState): ChatState {
  if (state.step !== "done") return state;
  const { accountId, date } = state.draft;
  return { ...state, step: "type", draft: { accountId, date }, history: [], returnToReview: false, notice: null };
}

export function chatReducer(state: ChatState, action: ChatAction, ctx: FlowContext): ChatState {
  switch (action.type) {
    case "pickType":
      return pickType(state, ctx, action.value);
    case "repeatLast":
      return repeatLast(state, ctx);
    case "pickCategory":
      return pickCategory(state, ctx, action.value);
    case "setAmount":
      return setAmount(state, ctx, action.value);
    case "pickAccount":
      return pickAccount(state, ctx, action.id);
    case "pickToAccount":
      return pickToAccount(state, ctx, action.id);
    case "pickDate":
      return pickDate(state, ctx, action.value);
    case "setNote":
      return setNote(state, ctx, action.value);
    case "edit":
      return edit(state, ctx, action.step);
    case "back":
      return back(state);
    case "submit":
      return submit(state);
    case "saveSucceeded":
      return state.step === "saving" ? { ...state, step: "done", savedCount: state.savedCount + 1 } : state;
    case "saveFailed":
      return state.step === "saving" ? { ...state, step: "error" } : state;
    case "retry":
      return state.step === "error" ? { ...state, step: "saving" } : state;
    case "startOver":
      return startOver(state);
  }
}
