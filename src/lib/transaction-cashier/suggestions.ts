import type { FlowAccount, LastTransaction, TransactionKind } from "@/lib/transaction-cashier/flow";

/** Jumlah tombol yang langsung terlihat; sisanya lewat "Lainnya…". */
export const VISIBLE_OPTIONS = 6;

export type SuggestionRow = {
  type: TransactionKind;
  category: string;
  accountId: string;
  toAccountId: string | null;
  amount: number;
};

export type TransactionSuggestions = {
  categoriesByType: Record<TransactionKind, string[]>;
  accountIds: string[];
  last: LastTransaction | null;
};

/** Urutkan nilai dari yang paling sering muncul; seri dimenangkan yang lebih baru muncul (baris sudah terurut terbaru dulu). */
function rankByFrequency(values: string[]): string[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.keys()].sort((a, b) => counts.get(b)! - counts.get(a)!);
}

/** `rows` wajib terurut dari transaksi terbaru ke terlama. */
export function buildSuggestions(rows: SuggestionRow[]): TransactionSuggestions {
  const categoriesOf = (type: TransactionKind) =>
    rankByFrequency(rows.filter((r) => r.type === type).map((r) => r.category));

  const first = rows[0];
  return {
    categoriesByType: {
      EXPENSE: categoriesOf("EXPENSE"),
      INCOME: categoriesOf("INCOME"),
      TRANSFER: categoriesOf("TRANSFER"),
    },
    accountIds: rankByFrequency(rows.flatMap((r) => (r.toAccountId ? [r.accountId, r.toAccountId] : [r.accountId]))),
    last: first
      ? {
          type: first.type,
          category: first.category,
          amount: first.amount,
          accountId: first.accountId,
          toAccountId: first.toAccountId,
        }
      : null,
  };
}

/** Pilihan yang disukai user tampil duluan, sisanya mengikuti urutan aslinya. */
export function rankOptions<T>(all: T[], preferred: T[]): T[] {
  const available = new Set(all);
  const head = preferred.filter((p) => available.has(p));
  const headSet = new Set(head);
  return [...head, ...all.filter((a) => !headSet.has(a))];
}

/** Rekening yang sering dipakai tampil duluan. */
export function rankAccounts(accounts: FlowAccount[], preferredIds: string[]): FlowAccount[] {
  const byId = new Map(accounts.map((a) => [a.id, a]));
  return rankOptions([...byId.keys()], preferredIds).map((id) => byId.get(id)!);
}

export function splitVisible<T>(options: T[], limit: number = VISIBLE_OPTIONS): { visible: T[]; hidden: T[] } {
  return { visible: options.slice(0, limit), hidden: options.slice(limit) };
}
