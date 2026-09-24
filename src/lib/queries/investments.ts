import { prisma } from "@/lib/prisma";

export async function getInvestments() {
  return prisma.investment.findMany({ orderBy: { platform: "asc" } });
}
