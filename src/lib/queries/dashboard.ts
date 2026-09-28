import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, subMonths } from "date-fns";
import { toNumber } from "@/lib/queries/shared";
import { getReceivablesWithStatus } from "@/lib/queries/receivables";

/**
 * Balance/asset/investment totals are summed in the database rather than by
 * fetching every row — only receivables need full rows, because their
 * outstanding amount depends on per-row payment history and a manual settled
 * flag, which no single SQL SUM can express.
 */
export async function getSummary() {
  const [balanceTotal, assetTotal, investmentTotal, receivables] = await Promise.all([
    prisma.bankAccount.aggregate({ _sum: { balance: true } }),
    prisma.asset.aggregate({ _sum: { value: true } }),
    prisma.investment.aggregate({ _sum: { currentValue: true } }),
    getReceivablesWithStatus(),
  ]);

  const totalBalance = toNumber(balanceTotal._sum.balance);
  const totalAssets = toNumber(assetTotal._sum.value);
  const totalInvestments = toNumber(investmentTotal._sum.currentValue);

  const outstanding = receivables.filter((r) => r.status !== "SETTLED");
  const totalDebt = outstanding
    .filter((r) => r.type === "UTANG")
    .reduce((sum, r) => sum + r.remaining, 0);
  const totalReceivables = outstanding
    .filter((r) => r.type === "PIUTANG")
    .reduce((sum, r) => sum + r.remaining, 0);

  const netWorth =
    totalBalance + totalAssets + totalInvestments + totalReceivables - totalDebt;

  return {
    totalBalance,
    totalAssets,
    totalInvestments,
    totalDebt,
    totalReceivables,
    netWorth,
  };
}

/**
 * Histori net worth bulanan dari `NetWorthSnapshot` — TIDAK direkonstruksi
 * mundur dari data lain, karena Asset/Investment diedit langsung (bukan
 * lewat log transaksi seperti BankAccount). Grafik hanya seakurat sejak
 * kapan snapshot pertama diambil.
 */
export async function getNetWorthHistory(months = 12) {
  const since = startOfMonth(subMonths(new Date(), months - 1));
  const snapshots = await prisma.netWorthSnapshot.findMany({
    where: { date: { gte: since } },
    orderBy: { date: "asc" },
  });

  return snapshots.map((s) => ({
    date: s.date,
    netWorth: toNumber(s.netWorth),
  }));
}

/**
 * Dipanggil cron bulanan (`/api/cron/snapshot-net-worth`) dan tombol manual
 * "Ambil Snapshot Sekarang" di dashboard. Upsert by tanggal 1 bulan berjalan
 * supaya re-run (retry cron, atau klik tombol manual dobel) aman/idempotent.
 */
export async function captureNetWorthSnapshot() {
  const summary = await getSummary();
  const date = startOfMonth(new Date());

  await prisma.netWorthSnapshot.upsert({
    where: { date },
    create: { date, ...summary },
    update: { ...summary },
  });
}

export async function getDailySummary(date: Date = new Date()) {
  const transactions = await prisma.transaction.findMany({
    where: { date: { gte: startOfDay(date), lte: endOfDay(date) } },
    include: { account: true },
    orderBy: { date: "desc" },
  });

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + toNumber(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + toNumber(t.amount), 0);

  return { transactions, income, expense };
}
