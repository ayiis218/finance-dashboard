import { startOfYear } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getInvestmentYearOverview(year: number) {
  const start = startOfYear(new Date(year, 0, 1));
  const end = startOfYear(new Date(year + 1, 0, 1));

  const [target, entries] = await Promise.all([
    prisma.investmentYearlyTarget.findUnique({ where: { year } }),
    prisma.investmentEntry.findMany({
      where: { month: { gte: start, lt: end } },
      include: { investment: true },
      orderBy: { month: "asc" },
    }),
  ]);

  const rows = entries.map((e) => ({
    id: e.id,
    investmentId: e.investmentId,
    platform: e.investment.platform,
    name: e.investment.name,
    month: e.month,
    amount: toNumber(e.amount),
  }));

  const totalInvested = rows.reduce((sum, r) => sum + r.amount, 0);
  const targetAmount = target ? toNumber(target.targetAmount) : 0;
  const remaining = Math.max(targetAmount - totalInvested, 0);
  const progressPct = targetAmount > 0 ? (totalInvested / targetAmount) * 100 : 0;
  const monthsWithEntry = new Set(rows.map((r) => r.month.getMonth()));

  return {
    year,
    target,
    rows,
    totalInvested,
    targetAmount,
    remaining,
    progressPct,
    monthsWithEntry,
  };
}
