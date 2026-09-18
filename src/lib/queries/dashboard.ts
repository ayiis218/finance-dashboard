import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
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
