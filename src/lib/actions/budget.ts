"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";
import { ensureCategoryExists } from "@/lib/actions/categories";

const budgetCategorySchema = z.object({
  name: z.string().min(1),
  monthlyPlanned: z.coerce.number().nonnegative(),
});

const BUDGET_CATEGORY_FIELDS = ["name", "monthlyPlanned"] as const;

export async function createBudgetCategory(formData: FormData) {
  const data = budgetCategorySchema.parse(pickFormFields(formData, BUDGET_CATEGORY_FIELDS));
  await ensureCategoryExists(prisma, data.name);
  await prisma.budgetCategory.create({ data });
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function updateBudgetCategory(id: string, formData: FormData) {
  const data = budgetCategorySchema.parse(pickFormFields(formData, BUDGET_CATEGORY_FIELDS));
  await prisma.budgetCategory.update({ where: { id }, data });
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deleteBudgetCategory(id: string) {
  await prisma.budgetCategory.delete({ where: { id } });
  revalidatePath("/budget");
  revalidatePath("/");
}

const budgetEntrySchema = z.object({
  categoryId: z.string().min(1),
  month: z.coerce.date(),
  expectation: z.coerce.number().nonnegative(),
  minTarget: z.coerce.number().nonnegative().optional(),
  maxTarget: z.coerce.number().nonnegative().optional(),
});

const budgetEntryUpdateSchema = budgetEntrySchema.omit({
  categoryId: true,
  month: true,
});

// `actual` sengaja tidak lagi di sini — dihitung otomatis dari Transaction
// sungguhan di getBudgetOverview(), bukan diketik manual lewat form ini.
const BUDGET_ENTRY_AMOUNT_FIELDS = ["expectation", "minTarget", "maxTarget"] as const;

export async function createBudgetEntry(formData: FormData) {
  const data = budgetEntrySchema.parse(
    pickFormFields(formData, ["categoryId", "month", ...BUDGET_ENTRY_AMOUNT_FIELDS]),
  );
  await prisma.budgetEntry.create({ data });
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function updateBudgetEntry(id: string, formData: FormData) {
  const data = budgetEntryUpdateSchema.parse(
    pickFormFields(formData, BUDGET_ENTRY_AMOUNT_FIELDS),
  );
  await prisma.budgetEntry.update({ where: { id }, data });
  revalidatePath("/budget");
  revalidatePath("/");
}

export async function deleteBudgetEntry(id: string) {
  await prisma.budgetEntry.delete({ where: { id } });
  revalidatePath("/budget");
  revalidatePath("/");
}
