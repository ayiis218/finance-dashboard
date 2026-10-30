"use server";

import { getBankAccounts } from "@/lib/queries/accounts";
import { getCategoryNames } from "@/lib/queries/categories";
import { getTransactionSuggestions } from "@/lib/queries/transaction-suggestions";
import type { FlowAccount } from "@/lib/transaction-cashier/flow";
import type { TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

export type QuickEntryData = {
  accounts: FlowAccount[];
  categories: string[];
  suggestions: TransactionSuggestions;
};

/**
 * Data kasir dimuat LAZY (saat FAB di-hover/diketuk), bukan di tiap render
 * halaman — jadi kasir bisa dipakai dari halaman manapun tanpa menambah query
 * ke semua halaman. Plain-object saja (Decimal Prisma tidak boleh menyeberang
 * ke Client Component), sama seperti pemetaan `accounts` di halaman Transactions.
 */
export async function loadQuickEntryData(): Promise<QuickEntryData> {
  const [accountRows, categories, suggestions] = await Promise.all([
    getBankAccounts(),
    getCategoryNames(),
    getTransactionSuggestions(),
  ]);
  return {
    accounts: accountRows.map((a) => ({ id: a.id, name: a.name })),
    categories,
    suggestions,
  };
}
