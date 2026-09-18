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

export async function getLatestTransaction() {
  return prisma.transaction.findFirst({
    orderBy: { date: "desc" },
    include: { account: true, toAccount: true },
  });
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

export async function getExpenseByCategory({ from, to }: { from: Date; to: Date }) {
  const transactions = await prisma.transaction.findMany({
    where: { type: "EXPENSE", date: { gte: from, lte: to } },
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

/**
 * Counts EXPENSE plus TRANSFER rows that leave the system (no destination
 * account) — an internal transfer between two owned accounts isn't spending.
 */
export async function getSpendingByCategoryDetailed({ from, to }: { from: Date; to: Date }) {
  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: from, lte: to },
      OR: [{ type: "EXPENSE" }, { type: "TRANSFER", toAccountId: null }],
    },
    select: { amount: true, category: true },
  });

  const byCategory = new Map<string, { total: number; count: number }>();
  for (const t of transactions) {
    const entry = byCategory.get(t.category) ?? { total: 0, count: 0 };
    entry.total += toNumber(t.amount);
    entry.count += 1;
    byCategory.set(t.category, entry);
  }

  const grandTotal = Array.from(byCategory.values()).reduce((sum, c) => sum + c.total, 0);

  return Array.from(byCategory.entries())
    .map(([category, { total, count }]) => ({
      category,
      total,
      count,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);
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
