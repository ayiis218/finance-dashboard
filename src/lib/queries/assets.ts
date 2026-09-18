import { prisma } from "@/lib/prisma";

export async function getAssets() {
  return prisma.asset.findMany({ orderBy: { acquiredDate: "desc" } });
}
