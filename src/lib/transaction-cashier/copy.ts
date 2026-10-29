import { format, parseISO } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { formatIDR } from "@/lib/format";
import {
  isAnswered,
  isQuestionStep,
  quickDates,
  stepsFor,
  type ChatState,
  type Draft,
  type EditableStep,
  type FlowContext,
  type LastTransaction,
  type QuestionStep,
  type Step,
  type TransactionKind,
} from "@/lib/transaction-cashier/flow";

/**
 * Semua teks yang diucapkan kasir (dan label jawaban) ada di sini — terpisah
 * dari `flow.ts` supaya alur bisa dites tanpa bergantung pada kata-katanya,
 * dan nada bicara bisa diubah di satu tempat.
 */

export const EXTERNAL_LABEL = "Di luar sistem";

export const TYPE_LABELS: Record<TransactionKind, string> = {
  EXPENSE: "Pengeluaran",
  INCOME: "Pemasukan",
  TRANSFER: "Transfer",
};

export const AMOUNT_MASK = "••••••";

/** Label tombol "ulangi transaksi terakhir"; nominal riwayat disamarkan saat privacy mode aktif. */
export function repeatLabel(last: LastTransaction, options: { maskAmount?: boolean } = {}): string {
  const amount = options.maskAmount ? AMOUNT_MASK : formatIDR(last.amount);
  if (last.type === "TRANSFER") return `Ulangi transfer ${amount}`;
  return `Ulangi: ${last.category} ${amount}`;
}

const EDIT_PROMPTS: Record<EditableStep, string> = {
  category: "Kategorinya jadi apa?",
  amount: "Jumlahnya jadi berapa?",
  account: "Rekeningnya ganti ke mana?",
  toAccount: "Rekening tujuannya ganti ke mana?",
  date: "Tanggalnya jadi kapan?",
  note: "Catatannya jadi apa?",
};

function questionPrompt(step: QuestionStep, draft: Draft, savedCount: number): string {
  const { type } = draft;
  switch (step) {
    case "type":
      return savedCount > 0 ? "Oke, lanjut! Mau catat apa lagi?" : "Halo! Mau catat apa hari ini?";
    case "category":
      return type === "INCOME" ? "Pemasukan dari mana nih?" : "Oke, belanja apa nih?";
    case "amount":
      if (type === "INCOME") return "Berapa yang masuk?";
      if (type === "TRANSFER") return "Berapa yang mau ditransfer?";
      return "Berapa totalnya?";
    case "account":
      if (type === "INCOME") return "Masuknya ke rekening mana?";
      if (type === "TRANSFER") return "Transfer dari rekening mana?";
      return "Dibayar pakai rekening mana?";
    case "toAccount":
      return "Ke rekening mana?";
    case "date":
      return "Kapan kejadiannya?";
    case "note":
      return "Ada catatan? Boleh dilewati.";
  }
}

const STATUS_PROMPTS: Record<Exclude<Step, QuestionStep>, string> = {
  review: "Cek dulu ya, sudah benar?",
  saving: "Sebentar, lagi saya catat…",
  done: "Beres, tercatat! Catat lagi?",
  error: "Waduh, gagal mencatat. Coba lagi?",
  blocked: "Belum ada rekening. Tambah rekening dulu di halaman Accounts, baru kita mulai.",
};

/** Satu ucapan kasir untuk keadaan saat ini (ditampilkan di bubble atas kepalanya). */
export function promptFor(state: ChatState): string {
  const { step } = state;
  if (!isQuestionStep(step)) return STATUS_PROMPTS[step];
  if (state.returnToReview && step !== "type") return EDIT_PROMPTS[step];
  return questionPrompt(step, state.draft, state.savedCount);
}

function dateLabel(value: string, ctx: FlowContext): string {
  const quick = quickDates(ctx.today).find((d) => d.value === value);
  return quick?.label ?? format(parseISO(value), "d MMMM yyyy", { locale: idLocale });
}

function accountName(accountId: string | undefined, ctx: FlowContext): string | undefined {
  return ctx.accounts.find((a) => a.id === accountId)?.name;
}

/** Jawaban user untuk satu langkah dalam bentuk teks pendek, atau `undefined` bila belum dijawab. */
export function answerLabel(step: QuestionStep, draft: Draft, ctx: FlowContext): string | undefined {
  if (!isAnswered(step, draft)) return undefined;
  switch (step) {
    case "type":
      return TYPE_LABELS[draft.type!];
    case "category":
      return draft.category;
    case "amount":
      return formatIDR(draft.amount!);
    case "account":
      return accountName(draft.accountId, ctx);
    case "toAccount":
      return draft.toAccountId === null ? EXTERNAL_LABEL : accountName(draft.toAccountId, ctx);
    case "date":
      return dateLabel(draft.date!, ctx);
    case "note":
      return draft.note ?? "Tanpa catatan";
  }
}

export type ReviewLine = {
  label: string;
  value: string;
  /** Langkah yang dibuka saat baris ini diubah; `null` bila baris tidak bisa diubah. */
  editStep: EditableStep | null;
};

const ACCOUNT_LABELS: Record<TransactionKind, string> = {
  EXPENSE: "Dibayar dari",
  INCOME: "Masuk ke",
  TRANSFER: "Dari rekening",
};

/** Baris-baris struk pada langkah review. */
export function reviewLines(draft: Draft, ctx: FlowContext): ReviewLine[] {
  const { type } = draft;
  if (!type) return [];
  const editable = new Set<Step>(stepsFor(type, ctx));
  const line = (label: string, step: QuestionStep, editStep: EditableStep): ReviewLine => ({
    label,
    value: answerLabel(step, draft, ctx) ?? "-",
    editStep: editable.has(editStep) ? editStep : null,
  });

  const lines: ReviewLine[] = [{ label: "Jenis", value: TYPE_LABELS[type], editStep: null }];
  if (type !== "TRANSFER") lines.push(line("Kategori", "category", "category"));
  lines.push(line("Jumlah", "amount", "amount"));
  lines.push(line(ACCOUNT_LABELS[type], "account", "account"));
  if (type === "TRANSFER") lines.push(line("Ke rekening", "toAccount", "toAccount"));
  lines.push(line("Tanggal", "date", "date"));
  lines.push(line("Catatan", "note", "note"));
  return lines;
}

/** Chip transfer memuat arahnya ("Dari BCA", "Ke Cash"); jenis lain memakai label jawaban apa adanya. */
function chipLabel(step: QuestionStep, draft: Draft, label: string): string {
  if (draft.type !== "TRANSFER") return label;
  if (step === "account") return `Dari ${label}`;
  if (step === "toAccount") return draft.toAccountId === null ? "Ke luar sistem" : `Ke ${label}`;
  return label;
}

/** Jawaban yang sudah terkumpul, untuk ditampilkan sebagai chip kecil di bawah kasir. */
export function collectedAnswers(state: ChatState, ctx: FlowContext): string[] {
  const { type } = state.draft;
  if (!type || state.step === "type" || state.step === "review") return [];
  const steps = stepsFor(type, ctx).filter(isQuestionStep);
  const answers = [TYPE_LABELS[type]];
  for (const step of steps) {
    if (step === state.step) break;
    const label = answerLabel(step, state.draft, ctx);
    if (label !== undefined) answers.push(chipLabel(step, state.draft, label));
  }
  return answers;
}
