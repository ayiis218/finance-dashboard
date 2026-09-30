import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { toNumber } from "@/lib/queries/shared";
import { getCategoryBreakdown } from "@/lib/queries/transactions";

export async function getBudgetCategories() {
  return prisma.budgetCategory.findMany({ orderBy: { name: "asc" } });
}

/**
 * `actual` dihitung otomatis dari Transaction sungguhan (EXPENSE + TRANSFER
 * keluar eksternal — definisi "spending" yang sama dengan breakdown kategori
 * di tempat lain), bukan lagi diketik manual — lihat `BudgetEntry.actual` di
 * schema, kolomnya sengaja dibiarkan ada tapi tidak dibaca/ditulis lagi.
 */
export async function getBudgetOverview(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const [categories, breakdown] = await Promise.all([
    prisma.budgetCategory.findMany({
      orderBy: { name: "asc" },
      include: { entries: { where: { month: start } } },
    }),
    getCategoryBreakdown({ from: start, to: end }),
  ]);

  const actualByCategory = new Map(breakdown.spendingDetailed.map((s) => [s.category, s.total]));

  const rows = categories.map((c) => {
    const entry = c.entries[0] ?? null;
    const actual = actualByCategory.get(c.name) ?? 0;
    const expectation = entry ? toNumber(entry.expectation) : 0;
    return {
      categoryId: c.id,
      categoryName: c.name,
      monthlyPlanned: toNumber(c.monthlyPlanned),
      entryId: entry?.id ?? null,
      actual,
      expectation,
      variance: actual - expectation,
      minTarget: entry?.minTarget != null ? toNumber(entry.minTarget) : null,
      maxTarget: entry?.maxTarget != null ? toNumber(entry.maxTarget) : null,
    };
  });

  const totals = rows.reduce(
    (acc, r) => ({
      planned: acc.planned + r.monthlyPlanned,
      actual: acc.actual + r.actual,
      expectation: acc.expectation + r.expectation,
    }),
    { planned: 0, actual: 0, expectation: 0 },
  );

  return { month: start, rows, totals };
}
