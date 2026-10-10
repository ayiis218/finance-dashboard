"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";
import { ensureCategoryExists } from "@/lib/actions/categories";

const savingsGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  tenorMonths: z.coerce.number().int().positive(),
  startDate: z.coerce.date(),
  autoTarget: z.string().optional().transform((v) => v === "on"),
});

const SAVINGS_GOAL_FIELDS = [
  "name",
  "targetAmount",
  "tenorMonths",
  "startDate",
  "autoTarget",
] as const;

export async function createSavingsGoal(formData: FormData) {
  const data = savingsGoalSchema.parse(pickFormFields(formData, SAVINGS_GOAL_FIELDS));
  await prisma.savingsGoal.create({ data });
  revalidatePath("/goals");
}

export async function updateSavingsGoal(id: string, formData: FormData) {
  const data = savingsGoalSchema.parse(pickFormFields(formData, SAVINGS_GOAL_FIELDS));
  await prisma.savingsGoal.update({ where: { id }, data });
  revalidatePath("/goals");
  revalidatePath(`/goals/${id}`);
}

export async function deleteSavingsGoal(id: string) {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/goals");
}

const savingsGoalEntrySchema = z.object({
  goalId: z.string().min(1),
  month: z.coerce.date(),
  amount: z.coerce.number().positive(),
  contributor: z.string().optional(),
});

export async function addSavingsGoalEntry(formData: FormData) {
  const data = savingsGoalEntrySchema.parse(
    pickFormFields(formData, ["goalId", "month", "amount", "contributor"]),
  );
  await prisma.savingsGoalEntry.create({ data });
  revalidatePath("/goals");
  revalidatePath(`/goals/${data.goalId}`);
}

/**
 * Once a goal has itemized budget rows, those rows — not the number typed
 * into the goal form — define the real target, so every item mutation
 * re-derives `targetAmount` from their sum. A goal with no items, or one
 * with `autoTarget` turned off (a manually-set target kept as a deliberate
 * buffer above the itemized sum), keeps whatever target was entered manually.
 */
async function syncGoalTargetToItems(goalId: string) {
  const goal = await prisma.savingsGoal.findUniqueOrThrow({
    where: { id: goalId },
    include: { items: true },
  });
  if (!goal.autoTarget || goal.items.length === 0) return;
  const total = goal.items.reduce((sum, i) => sum + Number(i.budgetAmount), 0);
  await prisma.savingsGoal.update({
    where: { id: goalId },
    data: { targetAmount: total },
  });
}

const goalItemSchema = z.object({
  goalId: z.string().min(1),
  category: z.string().min(1),
  name: z.string().min(1),
  budgetAmount: z.coerce.number().positive(),
  actualAmount: z.coerce.number().nonnegative().optional(),
  note: z.string().optional(),
});

const GOAL_ITEM_FIELDS = [
  "goalId",
  "category",
  "name",
  "budgetAmount",
  "actualAmount",
  "note",
] as const;

export async function createGoalItem(formData: FormData) {
  const data = goalItemSchema.parse(pickFormFields(formData, GOAL_ITEM_FIELDS));
  await ensureCategoryExists(prisma, data.category);
  await prisma.goalItem.create({ data });
  await syncGoalTargetToItems(data.goalId);
  revalidatePath(`/goals/${data.goalId}`);
  revalidatePath("/goals");
}

export async function updateGoalItem(id: string, goalId: string, formData: FormData) {
  const data = goalItemSchema.parse(pickFormFields(formData, GOAL_ITEM_FIELDS));
  const old = await prisma.goalItem.findUniqueOrThrow({ where: { id } });

  // Kalau item ini PAID dan `actualAmount`-nya dulu cuma hasil auto-backfill
  // dari budget lama (belum pernah disunting manual ke nilai lain), dan form
  // ini submit actualAmount yang sama persis (user tidak sengaja ubah field
  // Actual, cuma budgetAmount-nya) — ikut sesuaikan actualAmount ke budget
  // baru. Kalau user pernah sengaja set actual beda dari budget, nilai itu
  // tetap dijaga apa adanya.
  const actualAmount =
    old.status === "PAID" &&
    Number(old.actualAmount) === Number(old.budgetAmount) &&
    data.actualAmount === Number(old.actualAmount)
      ? data.budgetAmount
      : data.actualAmount;

  // `note` dinormalisasi ke `null` — form yang dikosongkan mengirim `undefined`
  // lewat pickFormFields, dan Prisma `update` melewati field `undefined` sama
  // sekali (bukan mengosongkannya), jadi note lama akan nyangkut kalau tidak
  // di-null-kan eksplisit di sini.
  await prisma.goalItem.update({
    where: { id },
    data: { ...data, actualAmount, note: data.note ?? null },
  });
  await syncGoalTargetToItems(goalId);
  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
}

/**
 * Marking an item PAID also backfills `actualAmount` from its budget when no
 * actual was ever entered — so a paid item never reports zero spend.
 */
export async function updateGoalItemStatus(
  id: string,
  goalId: string,
  status: "PLANNED" | "BOOKED" | "PAID",
) {
  const item = await prisma.goalItem.findUniqueOrThrow({ where: { id } });
  await prisma.goalItem.update({
    where: { id },
    data: {
      status,
      actualAmount:
        status === "PAID" && Number(item.actualAmount) === 0
          ? item.budgetAmount
          : item.actualAmount,
    },
  });
  revalidatePath(`/goals/${goalId}`);
}

export async function deleteGoalItem(id: string, goalId: string) {
  await prisma.goalItem.delete({ where: { id } });
  await syncGoalTargetToItems(goalId);
  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
}
