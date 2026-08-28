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

export async function deleteTransaction(id: string) {
  await prisma.transaction.delete({ where: { id } });
  revalidatePath("/transactions");
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

export async function deleteSavingsGoal(id: string) {
  await prisma.savingsGoal.delete({ where: { id } });
  revalidatePath("/goals");
}

const savingsGoalEntrySchema = z.object({
  goalId: z.string().min(1),
  month: z.coerce.date(),
  amount: z.coerce.number().positive(),
});

export async function addSavingsGoalEntry(formData: FormData) {
  const data = savingsGoalEntrySchema.parse({
    goalId: formData.get("goalId"),
    month: formData.get("month"),
    amount: formData.get("amount"),
  });
  await prisma.savingsGoalEntry.create({ data });
  revalidatePath("/goals");
}
