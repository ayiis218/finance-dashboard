"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bankAccountSchema = z.object({
  name: z.string().min(1),
  balance: z.coerce.number(),
  pocketChange: z.coerce.number().default(0),
});

export async function createBankAccount(formData: FormData) {
  const data = bankAccountSchema.parse({
    name: formData.get("name"),
    balance: formData.get("balance"),
    pocketChange: formData.get("pocketChange"),
  });
  await prisma.bankAccount.create({ data });
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function updateBankAccount(id: string, formData: FormData) {
  const data = bankAccountSchema.parse({
    name: formData.get("name"),
    balance: formData.get("balance"),
    pocketChange: formData.get("pocketChange"),
  });
  await prisma.bankAccount.update({ where: { id }, data });
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteBankAccount(id: string) {
  await prisma.bankAccount.delete({ where: { id } });
  revalidatePath("/accounts");
  revalidatePath("/");
}

const transactionSchema = z.object({
  accountId: z.string().min(1),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  note: z.string().optional(),
});

export async function createTransaction(formData: FormData) {
  const data = transactionSchema.parse({
    accountId: formData.get("accountId"),
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({ data });
    const delta = data.type === "EXPENSE" ? -data.amount : data.amount;
    if (data.type !== "TRANSFER") {
      await tx.bankAccount.update({
        where: { id: data.accountId },
        data: { balance: { increment: delta } },
      });
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function updateTransaction(id: string, formData: FormData) {
  const data = transactionSchema.parse({
    accountId: formData.get("accountId"),
    type: formData.get("type"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });

  await prisma.$transaction(async (tx) => {
    const old = await tx.transaction.findUniqueOrThrow({ where: { id } });

    if (old.type !== "TRANSFER") {
      const oldDelta = old.type === "EXPENSE" ? -Number(old.amount) : Number(old.amount);
      await tx.bankAccount.update({
        where: { id: old.accountId },
        data: { balance: { decrement: oldDelta } },
      });
    }

    await tx.transaction.update({ where: { id }, data });

    if (data.type !== "TRANSFER") {
      const newDelta = data.type === "EXPENSE" ? -data.amount : data.amount;
      await tx.bankAccount.update({
        where: { id: data.accountId },
        data: { balance: { increment: newDelta } },
      });
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await prisma.$transaction(async (tx) => {
    const old = await tx.transaction.findUniqueOrThrow({ where: { id } });
    if (old.type !== "TRANSFER") {
      const oldDelta = old.type === "EXPENSE" ? -Number(old.amount) : Number(old.amount);
      await tx.bankAccount.update({
        where: { id: old.accountId },
        data: { balance: { decrement: oldDelta } },
      });
    }
    await tx.transaction.delete({ where: { id } });
  });
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");
}

const assetSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1),
  value: z.coerce.number(),
  acquiredDate: z.coerce.date(),
});

export async function createAsset(formData: FormData) {
  const data = assetSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    value: formData.get("value"),
    acquiredDate: formData.get("acquiredDate"),
  });
  await prisma.asset.create({ data });
  revalidatePath("/assets");
  revalidatePath("/");
}

export async function updateAsset(id: string, formData: FormData) {
  const data = assetSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    value: formData.get("value"),
    acquiredDate: formData.get("acquiredDate"),
  });
  await prisma.asset.update({ where: { id }, data });
  revalidatePath("/assets");
  revalidatePath("/");
}

export async function deleteAsset(id: string) {
  await prisma.asset.delete({ where: { id } });
  revalidatePath("/assets");
  revalidatePath("/");
}

const investmentSchema = z.object({
  platform: z.string().min(1),
  name: z.string().min(1),
  buyValue: z.coerce.number(),
  currentValue: z.coerce.number(),
});

export async function createInvestment(formData: FormData) {
  const data = investmentSchema.parse({
    platform: formData.get("platform"),
    name: formData.get("name"),
    buyValue: formData.get("buyValue"),
    currentValue: formData.get("currentValue"),
  });
  await prisma.investment.create({ data });
  revalidatePath("/investments");
  revalidatePath("/");
}

export async function updateInvestment(id: string, formData: FormData) {
  const data = investmentSchema.parse({
    platform: formData.get("platform"),
    name: formData.get("name"),
    buyValue: formData.get("buyValue"),
    currentValue: formData.get("currentValue"),
  });
  await prisma.investment.update({ where: { id }, data });
  revalidatePath("/investments");
  revalidatePath("/");
}

export async function deleteInvestment(id: string) {
  await prisma.investment.delete({ where: { id } });
  revalidatePath("/investments");
  revalidatePath("/");
}

const receivableSchema = z.object({
  personName: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.enum(["PIUTANG", "UTANG"]),
  date: z.coerce.date(),
  note: z.string().optional(),
});

export async function createReceivable(formData: FormData) {
  const data = receivableSchema.parse({
    personName: formData.get("personName"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });
  await prisma.receivable.create({ data });
  revalidatePath("/receivables");
  revalidatePath("/");
}

export async function updateReceivable(id: string, formData: FormData) {
  const data = receivableSchema.parse({
    personName: formData.get("personName"),
    amount: formData.get("amount"),
    type: formData.get("type"),
    date: formData.get("date"),
    note: formData.get("note") || undefined,
  });
  await prisma.receivable.update({ where: { id }, data });
  revalidatePath("/receivables");
  revalidatePath("/");
}

export async function toggleReceivableSettled(id: string, isSettled: boolean) {
  await prisma.receivable.update({ where: { id }, data: { isSettled } });
  revalidatePath("/receivables");
  revalidatePath("/");
}

export async function deleteReceivable(id: string) {
  await prisma.receivable.delete({ where: { id } });
  revalidatePath("/receivables");
  revalidatePath("/");
}

const repaymentEntrySchema = z.object({
  receivableId: z.string().min(1),
  date: z.coerce.date(),
  amount: z.coerce.number().positive(),
  note: z.string().optional(),
});

export async function createRepaymentEntry(formData: FormData) {
  const data = repaymentEntrySchema.parse({
    receivableId: formData.get("receivableId"),
    date: formData.get("date"),
    amount: formData.get("amount"),
    note: formData.get("note") || undefined,
  });
  await prisma.repaymentEntry.create({ data });
  revalidatePath("/receivables");
}

export async function deleteRepaymentEntry(id: string) {
  await prisma.repaymentEntry.delete({ where: { id } });
  revalidatePath("/receivables");
}

const savingsGoalSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.coerce.number().positive(),
  tenorMonths: z.coerce.number().int().positive(),
  startDate: z.coerce.date(),
});

export async function createSavingsGoal(formData: FormData) {
  const data = savingsGoalSchema.parse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    tenorMonths: formData.get("tenorMonths"),
    startDate: formData.get("startDate"),
  });
  await prisma.savingsGoal.create({ data });
  revalidatePath("/goals");
}

export async function updateSavingsGoal(id: string, formData: FormData) {
  const data = savingsGoalSchema.parse({
    name: formData.get("name"),
    targetAmount: formData.get("targetAmount"),
    tenorMonths: formData.get("tenorMonths"),
    startDate: formData.get("startDate"),
  });
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
  const data = savingsGoalEntrySchema.parse({
    goalId: formData.get("goalId"),
    month: formData.get("month"),
    amount: formData.get("amount"),
    contributor: formData.get("contributor") || undefined,
  });
  await prisma.savingsGoalEntry.create({ data });
  revalidatePath("/goals");
  revalidatePath(`/goals/${data.goalId}`);
}

async function syncGoalTargetToItems(goalId: string) {
  const items = await prisma.goalItem.findMany({ where: { goalId } });
  if (items.length === 0) return;
  const total = items.reduce((sum, i) => sum + Number(i.budgetAmount), 0);
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
  note: z.string().optional(),
});

export async function createGoalItem(formData: FormData) {
  const data = goalItemSchema.parse({
    goalId: formData.get("goalId"),
    category: formData.get("category"),
    name: formData.get("name"),
    budgetAmount: formData.get("budgetAmount"),
    note: formData.get("note") || undefined,
  });
  await prisma.goalItem.create({ data });
  await syncGoalTargetToItems(data.goalId);
  revalidatePath(`/goals/${data.goalId}`);
  revalidatePath("/goals");
}

export async function updateGoalItem(id: string, goalId: string, formData: FormData) {
  const data = goalItemSchema.parse({
    goalId: formData.get("goalId"),
    category: formData.get("category"),
    name: formData.get("name"),
    budgetAmount: formData.get("budgetAmount"),
    note: formData.get("note") || undefined,
  });
  await prisma.goalItem.update({ where: { id }, data });
  await syncGoalTargetToItems(goalId);
  revalidatePath(`/goals/${goalId}`);
  revalidatePath("/goals");
}

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
