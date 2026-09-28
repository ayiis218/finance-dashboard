import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { getCategoryBreakdown } from "@/lib/queries/transactions";

const SIGNIFICANT_PCT_CHANGE = 20;
const SIGNIFICANT_SHARE_OF_TOTAL = 0.03;
const MAX_INSIGHTS = 3;

export type CategoryInsight = {
  category: string;
  currentTotal: number;
  previousTotal: number;
  delta: number;
  pctChange: number;
};

/**
 * Kategori spending (bulan `month` vs bulan sebelumnya) yang berubah cukup
 * signifikan untuk dilaporkan — ambang relatif terhadap total spend bulan
 * ini (bukan angka rupiah hardcode), supaya tetap masuk akal berapapun skala
 * pengeluarannya.
 */
export async function getCategorySpendingInsights(month: Date): Promise<CategoryInsight[]> {
  const current = { from: startOfMonth(month), to: endOfMonth(month) };
  const previousMonth = subMonths(month, 1);
  const previous = { from: startOfMonth(previousMonth), to: endOfMonth(previousMonth) };

  const [currentBreakdown, previousBreakdown] = await Promise.all([
    getCategoryBreakdown(current),
    getCategoryBreakdown(previous),
  ]);

  const currentTotals = new Map(
    currentBreakdown.spendingDetailed.map((c) => [c.category, c.total]),
  );
  const previousTotals = new Map(
    previousBreakdown.spendingDetailed.map((c) => [c.category, c.total]),
  );
  const totalCurrentSpend = Array.from(currentTotals.values()).reduce((sum, v) => sum + v, 0);
  const minDelta = totalCurrentSpend * SIGNIFICANT_SHARE_OF_TOTAL;

  const categories = new Set([...currentTotals.keys(), ...previousTotals.keys()]);
  const insights: CategoryInsight[] = [];

  for (const category of categories) {
    const currentTotal = currentTotals.get(category) ?? 0;
    const previousTotal = previousTotals.get(category) ?? 0;
    const delta = currentTotal - previousTotal;
    if (previousTotal === 0 || Math.abs(delta) < minDelta) continue;

    const pctChange = (delta / previousTotal) * 100;
    if (Math.abs(pctChange) < SIGNIFICANT_PCT_CHANGE) continue;

    insights.push({ category, currentTotal, previousTotal, delta, pctChange });
  }

  return insights
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, MAX_INSIGHTS);
}
