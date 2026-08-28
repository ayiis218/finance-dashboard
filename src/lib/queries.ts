import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subMonths } from "date-fns";

function toNumber(value: unknown): number {
  return value === null || value === undefined ? 0 : Number(value);
}

export async function getSummary() {
  const [accounts, assets, investments, receivables] = await Promise.all([
    prisma.bankAccount.findMany(),
    prisma.asset.findMany(),
    prisma.investment.findMany(),
    prisma.receivable.findMany({ where: { isSettled: false } }),
  ]);

  const totalSaldo = accounts.reduce(
    (sum, a) => sum + toNumber(a.balance) + toNumber(a.pocketChange),
    0,
  );
  const totalAset = assets.reduce((sum, a) => sum + toNumber(a.value), 0);
  const totalInvestasi = investments.reduce(
    (sum, i) => sum + toNumber(i.currentValue),
    0,
  );
  const totalUtang = receivables
    .filter((r) => r.type === "UTANG")
    .reduce((sum, r) => sum + toNumber(r.amount), 0);
  const totalPiutang = receivables
    .filter((r) => r.type === "PIUTANG")
    .reduce((sum, r) => sum + toNumber(r.amount), 0);

  const netWorth =
    totalSaldo + totalAset + totalInvestasi + totalPiutang - totalUtang;

  return {
    totalSaldo,
    totalAset,
    totalInvestasi,
    totalUtang,
    totalPiutang,
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

export async function getExpenseByCategory(month: Date = new Date()) {
  const start = startOfMonth(month);
  const transactions = await prisma.transaction.findMany({
    where: { type: "EXPENSE", date: { gte: start } },
    select: { amount: true, category: true },
  });

  const byCategory = new Map<string, number>();
  for (const t of transactions) {
    byCategory.set(
      t.category,
      (byCategory.get(t.category) ?? 0) + toNumber(t.amount),
    );
  }

  return Array.from(byCategory.entries()).map(([category, total]) => ({
    category,
    total,
  }));
}

export async function getInvestmentAllocation() {
  const investments = await prisma.investment.findMany();
  const byPlatform = new Map<string, number>();
  for (const i of investments) {
    byPlatform.set(
      i.platform,
      (byPlatform.get(i.platform) ?? 0) + toNumber(i.currentValue),
    );
  }
  return Array.from(byPlatform.entries()).map(([platform, total]) => ({
    platform,
    total,
  }));
}

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

export type ReceivableStatus = "BELUM_LUNAS" | "CICILAN_BERJALAN" | "LUNAS";

export async function getReceivablesWithStatus() {
  const receivables = await prisma.receivable.findMany({
    include: { payments: { orderBy: { date: "desc" } } },
    orderBy: [{ isSettled: "asc" }, { date: "desc" }],
  });

  return receivables.map((r) => {
    const amount = toNumber(r.amount);
    const totalPaid = r.payments.reduce((sum, p) => sum + toNumber(p.amount), 0);
    const remaining = Math.max(0, amount - totalPaid);
    let status: ReceivableStatus = "BELUM_LUNAS";
    if (r.isSettled || totalPaid >= amount) status = "LUNAS";
    else if (totalPaid > 0) status = "CICILAN_BERJALAN";

    return { ...r, totalPaid, remaining, status };
  });
}

export async function getDistinctCategories() {
  const rows = await prisma.transaction.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  return rows.map((r) => r.category);
}

export async function getTransactionsForMonth(month: Date) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  return prisma.transaction.findMany({
    where: { date: { gte: start, lte: end } },
    include: { account: true },
    orderBy: { date: "desc" },
  });
}

export async function getMonthlyExpenseComparison(months = 6) {
  const since = startOfMonth(subMonths(new Date(), months - 1));

  const transactions = await prisma.transaction.findMany({
    where: { type: "EXPENSE", date: { gte: since } },
    select: { amount: true, date: true },
  });

  const buckets = new Map<string, number>();
  for (let i = months - 1; i >= 0; i--) {
    const d = startOfMonth(subMonths(new Date(), i));
    const key = d.toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
    buckets.set(key, 0);
  }

  for (const t of transactions) {
    const key = startOfMonth(t.date).toLocaleDateString("id-ID", {
      month: "short",
      year: "2-digit",
    });
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + toNumber(t.amount));
    }
  }

  return Array.from(buckets.entries()).map(([month, total]) => ({
    month,
    total,
  }));
}
