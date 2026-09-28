import { prisma } from "@/lib/prisma";

export async function getRecurringTransactions() {
  return prisma.recurringTransaction.findMany({
    include: { account: true, toAccount: true },
    orderBy: { nextRunDate: "asc" },
  });
}
