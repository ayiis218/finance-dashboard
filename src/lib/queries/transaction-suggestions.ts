import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";
import { buildSuggestions, type TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

const WINDOW_DAYS = 90;
const MAX_ROWS = 500;

/** Riwayat ringan untuk menyusun tombol cerdas di chat (kategori/rekening favorit, transaksi terakhir). */
export async function getTransactionSuggestions(now = new Date()): Promise<TransactionSuggestions> {
  const rows = await prisma.transaction.findMany({
    where: { date: { gte: subDays(now, WINDOW_DAYS) } },
    select: { type: true, category: true, accountId: true, toAccountId: true, amount: true },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    take: MAX_ROWS,
  });
  return buildSuggestions(rows.map((r) => ({ ...r, amount: toNumber(r.amount) })));
}
