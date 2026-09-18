import { prisma } from "@/lib/prisma";
import { startOfMonth } from "date-fns";
import { toNumber } from "@/lib/queries/shared";

export async function getBudgetCategories() {
  return prisma.budgetCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getBudgetOverview(month: Date) {
  const start = startOfMonth(month);
  const categories = await prisma.budgetCategory.findMany({
    orderBy: { name: "asc" },
    include: { entries: { where: { month: start } } },
  });

  const rows = categories.map((c) => {
    const entry = c.entries[0] ?? null;
    const actual = entry ? toNumber(entry.actual) : 0;
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
