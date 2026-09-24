import { startOfYear } from "date-fns";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getCashflowAllocationTemplate() {
  const template = await prisma.cashflowAllocationTemplate.findFirst({
    include: { items: true },
  });
  return {
    id: template?.id ?? null,
    monthlyIncome: template ? toNumber(template.monthlyIncome) : 0,
    items: (template?.items ?? []).map((i) => ({
      id: i.id,
      label: i.label,
      amount: toNumber(i.amount),
    })),
  };
}

export async function getCashflowYearOverview(year: number) {
  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = startOfYear(new Date(year + 1, 0, 1));

  const [forecasts, template] = await Promise.all([
    prisma.cashflowForecast.findMany({
      where: { month: { gte: yearStart, lt: yearEnd } },
      include: { budgetItems: true },
    }),
    getCashflowAllocationTemplate(),
  ]);
  const forecastByMonth = new Map(forecasts.map((f) => [f.month.getMonth(), f]));

  const rows = Array.from({ length: 12 }, (_, m) => {
    const stored = forecastByMonth.get(m);
    const isDefaultTemplate = !stored;
    const saldoAwal = stored ? toNumber(stored.saldoAwal) : 0;
    const monthlyIncome = stored ? toNumber(stored.monthlyIncome) : template.monthlyIncome;
    const totalBudget = stored
      ? stored.budgetItems.reduce((sum, i) => sum + toNumber(i.amount), 0)
      : template.items.reduce((sum, i) => sum + i.amount, 0);
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
      itemCount: stored ? stored.budgetItems.length : template.items.length,
      isDefaultTemplate,
    };
  });

  return { year, rows };
}

export async function getCashflowMonthDetail(month: Date) {
  const [stored, template] = await Promise.all([
    prisma.cashflowForecast.findUnique({
      where: { month },
      include: { budgetItems: { orderBy: { createdAt: "asc" } } },
    }),
    getCashflowAllocationTemplate(),
  ]);
  const isDefaultTemplate = !stored;

  const saldoAwal = stored ? toNumber(stored.saldoAwal) : 0;
  const monthlyIncome = stored ? toNumber(stored.monthlyIncome) : template.monthlyIncome;
  const budgetItems = stored
    ? stored.budgetItems.map((i) => ({ id: i.id, label: i.label, amount: toNumber(i.amount) }))
    : template.items;
  const totalBudget = budgetItems.reduce((sum, i) => sum + i.amount, 0);
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
    budgetItems,
    totalBudget,
    amountSave,
    saldoAkhirExpected,
    variance,
    isDefaultTemplate,
  };
}
