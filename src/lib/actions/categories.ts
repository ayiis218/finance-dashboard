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
 * maksudnya sama — semua Transaction/Asset/GoalItem/RecurringTransaction yang
 * masih pakai nama lama ikut di-update dalam SATU transaction DB yang sama
 * dengan rename-nya.
 *
 * Kalau `newName` sudah dipakai Category lain (skenario "gabungkan dua
 * kategori", mis. "kendaraan" -> "Kendaraan" yang sudah ada), row Category
 * yang lama dihapus alih-alih di-rename ke nama yang sudah dipakai — rename
 * ke nama yang sudah ada itu sendiri akan gagal kena unique constraint kalau
 * tetap dipaksa `update`.
 *
 * `BudgetCategory.name` ikut disamakan HANYA kalau tidak ada BudgetCategory
 * lain yang sudah pakai `newName` — BudgetCategory punya baris BudgetEntry
 * per bulan sendiri, jadi kalau `newName` sudah punya BudgetCategory sendiri,
 * menggabungkannya berarti memutuskan entry bulan mana yang menang, itu
 * keputusan editorial yang tidak aman diotomatisasi diam-diam — dibiarkan
 * tidak sinkron untuk kasus itu.
 */
export async function renameCategory(id: string, formData: FormData) {
  const data = categorySchema.parse(pickFormFields(formData, ["name"] as const));
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });
  const oldName = category.name;
  const newName = data.name;

  if (oldName === newName) return;

  const [existingTarget, budgetCategoryConflict] = await Promise.all([
    prisma.category.findUnique({ where: { name: newName } }),
    prisma.budgetCategory.findUnique({ where: { name: newName } }),
  ]);

  await prisma.$transaction([
    existingTarget
      ? prisma.category.delete({ where: { id } })
      : prisma.category.update({ where: { id }, data: { name: newName } }),
    prisma.transaction.updateMany({ where: { category: oldName }, data: { category: newName } }),
    prisma.asset.updateMany({ where: { category: oldName }, data: { category: newName } }),
    prisma.goalItem.updateMany({ where: { category: oldName }, data: { category: newName } }),
    prisma.recurringTransaction.updateMany({
      where: { category: oldName },
      data: { category: newName },
    }),
    // Skip kalau newName sudah punya BudgetCategory sendiri — lihat catatan di atas.
    ...(budgetCategoryConflict
      ? []
      : [prisma.budgetCategory.updateMany({ where: { name: oldName }, data: { name: newName } })]),
  ]);

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/assets");
  revalidatePath("/goals");
  revalidatePath("/recurring");
  revalidatePath("/budget");
}

export async function deleteCategory(id: string) {
  const category = await prisma.category.findUniqueOrThrow({ where: { id } });

  const [txCount, assetCount, goalItemCount, recurringCount] = await Promise.all([
    prisma.transaction.count({ where: { category: category.name } }),
    prisma.asset.count({ where: { category: category.name } }),
    prisma.goalItem.count({ where: { category: category.name } }),
    prisma.recurringTransaction.count({ where: { category: category.name } }),
  ]);

  if (txCount + assetCount + goalItemCount + recurringCount > 0) {
    throw new Error("Kategori masih dipakai, rename atau pindahkan datanya dulu sebelum dihapus.");
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/categories");
}
