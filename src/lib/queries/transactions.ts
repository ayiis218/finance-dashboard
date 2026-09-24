import { prisma } from "@/lib/prisma";
import type { Prisma, TransactionType } from "@prisma/client";
import { startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { toNumber } from "@/lib/queries/shared";

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
    include: { account: true, toAccount: true },
    orderBy: { date: "desc" },
  });
}

export async function getTransactionsFiltered({
  month,
  q,
  type,
  accountId,
  page = 1,
  pageSize = 20,
}: {
  month: Date;
  q?: string;
  type?: TransactionType;
  accountId?: string;
  page?: number;
  pageSize?: number;
}) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const where: Prisma.TransactionWhereInput = {
    date: { gte: start, lte: end },
    ...(type ? { type } : {}),
    ...(accountId ? { accountId } : {}),
    ...(q
      ? {
          OR: [
            { category: { contains: q, mode: "insensitive" } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { account: true, toAccount: true },
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return {
    transactions,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Single query backing both the "Expense by Category" pie (EXPENSE rows
 * only) and the "Expense Breakdown by Category" table (EXPENSE plus TRANSFER
 * rows that leave the system, i.e. no destination account — an internal
 * transfer between two owned accounts isn't spending). Merged into one
 * `findMany` — the pie's row set is a strict subset of the table's, so
 * fetching them separately was two full scans of the same range for no
 * reason. `q`/`type`/`accountId` mirror the same filters `getTransactionsFiltered`
 * applies, so this breakdown always matches whatever the transaction table
 * above it is currently showing.
 */
export async function getCategoryBreakdown({
  from,
  to,
  q,
  type,
  accountId,
}: {
  from: Date;
  to: Date;
  q?: string;
  type?: TransactionType;
  accountId?: string;
}) {
  const transactions = await prisma.transaction.findMany({
    where: {
      AND: [
        { date: { gte: from, lte: to } },
        { OR: [{ type: "EXPENSE" }, { type: "TRANSFER", toAccountId: null }] },
        ...(accountId ? [{ accountId }] : []),
        ...(q
          ? [
              {
                OR: [
                  { category: { contains: q, mode: "insensitive" as const } },
                  { note: { contains: q, mode: "insensitive" as const } },
                ],
              },
            ]
          : []),
        ...(type ? [{ type }] : []),
      ],
    },
    select: { type: true, amount: true, category: true },
  });

  const expenseTotals = new Map<string, number>();
  const detailedTotals = new Map<string, { total: number; count: number }>();

  for (const t of transactions) {
    const amount = toNumber(t.amount);

    const detailed = detailedTotals.get(t.category) ?? { total: 0, count: 0 };
    detailed.total += amount;
    detailed.count += 1;
    detailedTotals.set(t.category, detailed);

    if (t.type === "EXPENSE") {
      expenseTotals.set(t.category, (expenseTotals.get(t.category) ?? 0) + amount);
    }
  }

  const expenseByCategory = Array.from(expenseTotals.entries()).map(([category, total]) => ({
    category,
    total,
  }));

  const grandTotal = Array.from(detailedTotals.values()).reduce((sum, c) => sum + c.total, 0);
  const spendingDetailed = Array.from(detailedTotals.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  return { expenseByCategory, spendingDetailed };
}

/**
 * DB-side sums for the month, independent of `getTransactionsFiltered`'s
 * pagination (which only ever returns one page of rows — summing that
 * client-side under-counts any month with more than `pageSize` matches).
 * Deliberately ignores the `type` filter: "Expense This Month"/"Net This
 * Month" describe the whole month's money movement, not whatever row type
 * the table is currently narrowed to — `q`/`accountId` still narrow it,
 * since those genuinely mean "only this account" / "only rows matching this
 * search", where `type` here would mean "pretend income didn't happen".
 */
export async function getTransactionsMonthlyTotals({
  month,
  q,
  accountId,
}: {
  month: Date;
  q?: string;
  accountId?: string;
}) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const baseWhere: Prisma.TransactionWhereInput = {
    date: { gte: start, lte: end },
    ...(accountId ? { accountId } : {}),
    ...(q
      ? {
          OR: [
            { category: { contains: q, mode: "insensitive" } },
            { note: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [incomeAgg, expenseAgg] = await Promise.all([
    prisma.transaction.aggregate({ where: { ...baseWhere, type: "INCOME" }, _sum: { amount: true } }),
    prisma.transaction.aggregate({ where: { ...baseWhere, type: "EXPENSE" }, _sum: { amount: true } }),
  ]);

  return {
    income: toNumber(incomeAgg._sum.amount),
    expense: toNumber(expenseAgg._sum.amount),
  };
}

export async function getMonthlyExpenseComparison({ from, to }: { from: Date; to: Date }) {
  const transactions = await prisma.transaction.findMany({
    where: { type: "EXPENSE", date: { gte: from, lte: to } },
    select: { amount: true, date: true },
  });

  const buckets = new Map<string, number>();
  for (const d of eachMonthOfInterval({ start: startOfMonth(from), end: startOfMonth(to) })) {
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
