import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export async function getCategoryNames() {
  const rows = await getCategories();
  return rows.map((r) => r.name);
}
