import { startOfYear, subMonths } from "date-fns";
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

/**
 * Default `saldoAwal` untuk bulan yang belum dimaterialisasi — saldo akhir
 * bulan sebelumnya (aktual kalau sudah diisi, else proyeksi/expected), bukan
 * literal 0. `maxLookbackYears` membatasi rekursi lintas tahun (Januari yang
 * butuh Desember tahun sebelumnya) supaya tidak looping mundur tanpa batas
 * kalau dipanggil untuk tahun yang jauh sebelum data pertama pernah ada.
 */
export async function getCarryForwardSaldoAwal(month: Date, maxLookbackYears = 5): Promise<number> {
  if (maxLookbackYears <= 0) return 0;
  const prevMonth = subMonths(month, 1);
  const overview = await getCashflowYearOverview(prevMonth.getFullYear(), maxLookbackYears - 1);
  const prevRow = overview.rows[prevMonth.getMonth()];
  return prevRow.saldoAkhirActual ?? prevRow.saldoAkhirExpected;
}

export async function getCashflowYearOverview(year: number, maxLookbackYears = 5) {
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

  // Loop sekuensial (bukan Array.from stateless) supaya bulan ke-m bisa baca
  // saldo akhir bulan ke-(m-1) yang BARU dihitung dalam pemanggilan yang
  // sama — carry-forward tanpa query tambahan untuk 11 dari 12 bulan.
  const rows: {
    id: string | null;
    month: Date;
    saldoAwal: number;
    monthlyIncome: number;
    totalBudget: number;
    amountSave: number;
    saldoAkhirExpected: number;
    saldoAkhirActual: number | null;
    variance: number | null;
    itemCount: number;
    isDefaultTemplate: boolean;
  }[] = [];

  for (let m = 0; m < 12; m++) {
    const stored = forecastByMonth.get(m);
    const isDefaultTemplate = !stored;

    let saldoAwal: number;
    if (stored) {
      saldoAwal = toNumber(stored.saldoAwal);
    } else if (m === 0) {
      saldoAwal = await getCarryForwardSaldoAwal(new Date(year, 0, 1), maxLookbackYears);
    } else {
      const prev = rows[m - 1];
      saldoAwal = prev.saldoAkhirActual ?? prev.saldoAkhirExpected;
    }

    const monthlyIncome = stored ? toNumber(stored.monthlyIncome) : template.monthlyIncome;
    const totalBudget = stored
      ? stored.budgetItems.reduce((sum, i) => sum + toNumber(i.amount), 0)
      : template.items.reduce((sum, i) => sum + i.amount, 0);
    const amountSave = monthlyIncome - totalBudget;
    const saldoAkhirExpected = saldoAwal + amountSave;
    const saldoAkhirActual = stored?.saldoAkhirActual != null ? toNumber(stored.saldoAkhirActual) : null;
    const variance = saldoAkhirActual != null ? saldoAkhirActual - saldoAkhirExpected : null;

    rows.push({
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
    });
  }

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

  const saldoAwal = stored
    ? toNumber(stored.saldoAwal)
    : await getCarryForwardSaldoAwal(month);
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
