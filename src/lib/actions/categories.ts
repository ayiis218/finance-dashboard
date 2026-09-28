"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

/**
 * Dipanggil dari `createTransactionWithClient`, `createBudgetCategory`, dan
 * `createGoalItem` tiap kali dapat nama kategori — supaya tabel `Category`
 * (sumber datalist di semua form) selalu lengkap tanpa langkah manual
 * tambahan. Menerima `Prisma.TransactionClient` (bukan cuma `prisma` global)
 * supaya bisa dipanggil di dalam transaction pemanggilnya sendiri.
 */
export async function ensureCategoryExists(client: Prisma.TransactionClient, name: string) {
  await client.category.upsert({
    where: { name },
    create: { name },
    update: {},
  });
}

const categorySchema = z.object({ name: z.string().min(1) });

export async function createCategory(formData: FormData) {
  const data = categorySchema.parse(pickFormFields(formData, ["name"] as const));
  await ensureCategoryExists(prisma, data.name);
  revalidatePath("/categories");
}

/**
 * Rename adalah mekanisme "gabungkan" kategori lama yang beda-beda nama tapi
 * maksudnya sama — semua Transaction/Asset/GoalItem yang masih pakai nama
 * lama ikut di-update dalam SATU transaction DB yang sama dengan rename-nya.
 */
export async function renameCategory(id: string, formData: FormData) {
  const data = categorySchema.parse(pickFormFields(formData, ["name"] as const));
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  const oldName = category.name;
  const newName = data.name;

  if (oldName === newName) return;

  await prisma.$transaction([
    prisma.category.update({ where: { id }, data: { name: newName } }),
    prisma.transaction.updateMany({ where: { category: oldName }, data: { category: newName } }),
    prisma.asset.updateMany({ where: { category: oldName }, data: { category: newName } }),
    prisma.goalItem.updateMany({ where: { category: oldName }, data: { category: newName } }),
  ]);

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/assets");
  revalidatePath("/goals");
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });

  const [txCount, assetCount, goalItemCount] = await Promise.all([
    prisma.transaction.count({ where: { category: category.name } }),
    prisma.asset.count({ where: { category: category.name } }),
    prisma.goalItem.count({ where: { category: category.name } }),
  ]);

  if (txCount + assetCount + goalItemCount > 0) {
    throw new Error("Kategori masih dipakai, rename atau pindahkan datanya dulu sebelum dihapus.");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}
