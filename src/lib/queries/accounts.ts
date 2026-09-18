import { prisma } from "@/lib/prisma";

export async function getBankAccounts() {
  return prisma.bankAccount.findMany({ orderBy: { name: "asc" } });
}
