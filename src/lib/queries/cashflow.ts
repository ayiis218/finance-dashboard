import { startOfYear } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

/**
 * `BankAccount.balance` is only a live running total — there's no stored
 * history — so a past/future point-in-time total is reconstructed by
 * rolling the current total back through every transaction dated on or
 * after that point. An internal TRANSFER (toAccountId set) nets to zero on
 * the aggregate total since the money never leaves the wallet; everything
 * else (INCOME, EXPENSE, external TRANSFER) moves the total the same way
 * `createTransaction` moves the source account's balance.
 */
function netEffect(t: { type: string; amount: unknown; toAccountId: string | null }): number {
  const amount = Number(t.amount);
  if (t.type === "INCOME") return amount;
  if (t.type === "EXPENSE") return -amount;
  return t.toAccountId ? 0 : -amount;
}

/** Total wallet balance at the start of each month of `year`, plus one extra boundary for the start of the next year (= end of December). Index 0 = start of Jan, index 12 = start of next Jan. */
export async function getWalletBalanceTimeline(year: number): Promise<number[]> {
  const yearStart = startOfYear(new Date(year, 0, 1));

  const [currentTotal, laterTransactions] = await Promise.all([
    prisma.bankAccount.aggregate({ _sum: { balance: true } }),
    prisma.transaction.findMany({
      where: { date: { gte: yearStart }, affectsBalance: true },
      select: { type: true, amount: true, toAccountId: true, date: true },
    }),
  ]);

  const currentTotalNum = toNumber(currentTotal._sum.balance);
  const boundaries = Array.from(
    { length: 13 },
    (_, i) => new Date(year + Math.floor(i / 12), i % 12, 1),
  );

  return boundaries.map((boundary) => {
    const netDeltaSince = laterTransactions
      .filter((t) => t.date >= boundary)
      .reduce((sum, t) => sum + netEffect(t), 0);
    return currentTotalNum - netDeltaSince;
  });
}

export async function getCashflowYearOverview(year: number) {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = startOfYear(new Date(year + 1, 0, 1));

  const [balances, forecastRows] = await Promise.all([
    getWalletBalanceTimeline(year),
    prisma.cashflowForecast.findMany({
      where: { month: { gte: yearStart, lt: yearEnd } },
    }),
  ]);

  const forecastByMonth = new Map(forecastRows.map((f) => [f.month.getMonth(), f]));

  const rows = Array.from({ length: 12 }, (_, m) => {
    const stored = forecastByMonth.get(m);
    const saldoAwal = balances[m];
    const saldoAkhirWalletLive = balances[m + 1];
    const expectedDelta = stored ? toNumber(stored.expectedDelta) : 0;
    const saldoAkhirExpected = saldoAwal + expectedDelta;
    const isActualOverridden = stored?.saldoAkhirActual != null;
    const saldoAkhirActual = isActualOverridden
      ? toNumber(stored!.saldoAkhirActual)
      : saldoAkhirWalletLive;
    const variance = saldoAkhirActual - saldoAkhirExpected;

    return {
      month: new Date(year, m, 1),
      saldoAwal,
      expectedDelta,
      saldoAkhirExpected,
      saldoAkhirActual,
      saldoAkhirWalletLive,
      isActualOverridden,
      variance,
    };
  });

  return { year, rows };
}
