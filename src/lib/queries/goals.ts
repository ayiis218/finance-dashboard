import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getGoalDetail(id: string) {
  const goal = await prisma.savingsGoal.findUniqueOrThrow({
    where: { id },
    include: {
      items: { orderBy: { createdAt: "asc" } },
      entries: { orderBy: { month: "desc" } },
    },
  });

  const itemsByCategory = new Map<
    string,
    { category: string; items: typeof goal.items; total: number }
  >();
  for (const item of goal.items) {
    const bucket = itemsByCategory.get(item.category) ?? {
      category: item.category,
      items: [],
      total: 0,
    };
    bucket.items.push(item);
    bucket.total += toNumber(item.budgetAmount);
    itemsByCategory.set(item.category, bucket);
  }

  const totalSaved = goal.entries.reduce(
    (sum, e) => sum + toNumber(e.amount),
    0,
  );
  const totalBudgeted = goal.items.reduce(
    (sum, i) => sum + toNumber(i.budgetAmount),
    0,
  );

  return {
    goal,
    categories: Array.from(itemsByCategory.values()),
    totalSaved,
    totalBudgeted,
  };
}

export async function getSavingsGoals() {
  return prisma.savingsGoal.findMany({
    include: { entries: true, items: true },
    orderBy: { createdAt: "desc" },
  });
}
