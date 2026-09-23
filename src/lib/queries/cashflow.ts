import { startOfYear } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getCashflowYearOverview(year: number) {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = startOfYear(new Date(year + 1, 0, 1));

  const forecasts = await prisma.cashflowForecast.findMany({
    where: { month: { gte: yearStart, lt: yearEnd } },
    include: { budgetItems: true },
  });
  const forecastByMonth = new Map(forecasts.map((f) => [f.month.getMonth(), f]));

  const rows = Array.from({ length: 12 }, (_, m) => {
    const stored = forecastByMonth.get(m);
    const saldoAwal = stored ? toNumber(stored.saldoAwal) : 0;
    const monthlyIncome = stored ? toNumber(stored.monthlyIncome) : 0;
    const totalBudget = stored
      ? stored.budgetItems.reduce((sum, i) => sum + toNumber(i.amount), 0)
      : 0;
    const amountSave = monthlyIncome - totalBudget;
    const saldoAkhirExpected = saldoAwal + amountSave;
    const saldoAkhirActual = stored?.saldoAkhirActual != null ? toNumber(stored.saldoAkhirActual) : null;
    const variance = saldoAkhirActual != null ? saldoAkhirActual - saldoAkhirExpected : null;

    return {
      id: stored?.id ?? null,
      month: new Date(year, m, 1),
      saldoAwal,
      monthlyIncome,
      totalBudget,
      amountSave,
      saldoAkhirExpected,
      saldoAkhirActual,
      variance,
      itemCount: stored?.budgetItems.length ?? 0,
    };
  });

  return { year, rows };
}

export async function getCashflowMonthDetail(month: Date) {
  const stored = await prisma.cashflowForecast.findUnique({
    where: { month },
    include: { budgetItems: { orderBy: { createdAt: "asc" } } },
  });

  const saldoAwal = stored ? toNumber(stored.saldoAwal) : 0;
  const monthlyIncome = stored ? toNumber(stored.monthlyIncome) : 0;
  const budgetItems = stored?.budgetItems ?? [];
  const totalBudget = budgetItems.reduce((sum, i) => sum + toNumber(i.amount), 0);
  const amountSave = monthlyIncome - totalBudget;
  const saldoAkhirExpected = saldoAwal + amountSave;
  const saldoAkhirActual = stored?.saldoAkhirActual != null ? toNumber(stored.saldoAkhirActual) : null;
  const variance = saldoAkhirActual != null ? saldoAkhirActual - saldoAkhirExpected : null;

  return {
    id: stored?.id ?? null,
    month,
    saldoAwal,
    monthlyIncome,
    saldoAkhirActual,
    budgetItems: budgetItems.map((i) => ({
      id: i.id,
      label: i.label,
      amount: toNumber(i.amount),
    })),
    totalBudget,
    amountSave,
    saldoAkhirExpected,
    variance,
  };
}
