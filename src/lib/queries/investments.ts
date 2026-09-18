import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getInvestments() {
  return prisma.investment.findMany({ orderBy: { platform: "asc" } });
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
