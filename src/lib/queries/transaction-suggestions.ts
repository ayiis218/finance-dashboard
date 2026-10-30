import { subDays } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";
import { buildSuggestions, type TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

const WINDOW_DAYS = 90;
const MAX_ROWS = 500;

/**
 * Riwayat ringan untuk menyusun tombol cerdas di kasir (kategori/rekening
 * favorit, transaksi terakhir).
 *
 * Fitur opsional ini ikut dirender di halaman Transactions, dan halaman itu
 * juga dirender ulang di dalam respons Server Action simpan. Kegagalan di sini
 * TIDAK boleh sampai menggagalkan render tersebut — klien akan mengira simpan
 * gagal padahal sudah ter-commit. Jadi error ditelan (dilog) dan kasir
 * berjalan tanpa saran.
 */
export async function getTransactionSuggestions(now = new Date()): Promise<TransactionSuggestions> {
  try {
    // Urut menurut kapan DIMASUKKAN: "Ulangi" harus menawarkan yang baru saja diinput user, bukan
    // transaksi yang kebetulan bertanggal paling baru (bertanggal maju/mundur, atau dibuat cron).
    const rows = await prisma.transaction.findMany({
      where: { createdAt: { gte: subDays(now, WINDOW_DAYS) } },
      select: { type: true, category: true, accountId: true, toAccountId: true, amount: true, createdAt: true },
      orderBy: { createdAt: "desc" },
      take: MAX_ROWS,
    });
    return buildSuggestions(
      rows.map(({ createdAt, amount, ...rest }) => ({ ...rest, amount: toNumber(amount), enteredAt: createdAt.toISOString() })),
    );
  } catch (error) {
    console.error("getTransactionSuggestions failed; the cashier runs without suggestions", error);
    return buildSuggestions([]);
  }
}
