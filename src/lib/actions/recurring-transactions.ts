"use server";

import { revalidatePath } from "next/cache";
import { addDays, addMonths, addWeeks } from "date-fns";
import { z } from "zod";
import type { RecurringFrequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";
import { createTransactionWithClient } from "@/lib/actions/transactions";
import { ensureCategoryExists } from "@/lib/actions/categories";

const recurringSchema = z.object({
  accountId: z.string().min(1),
  toAccountId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  note: z.string().optional(),
  affectsBalance: z.string().optional().transform((v) => v === "on"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

const RECURRING_FIELDS = [
  "accountId",
  "toAccountId",
  "type",
  "category",
  "amount",
  "note",
  "affectsBalance",
  "frequency",
  "startDate",
  "endDate",
] as const;

/** Sama seperti `normalizeTransactionData` di transactions.ts — `toAccountId` cuma valid untuk TRANSFER. */
function normalizeRecurringData<T extends z.infer<typeof recurringSchema>>(data: T) {
  const toAccountId = data.type === "TRANSFER" ? (data.toAccountId ?? null) : null;
  if (toAccountId && toAccountId === data.accountId) {
    throw new Error("Rekening tujuan tidak boleh sama dengan rekening asal.");
  }
  return { ...data, toAccountId };
}

export async function createRecurringTransaction(formData: FormData) {
  const data = normalizeRecurringData(
    recurringSchema.parse(pickFormFields(formData, RECURRING_FIELDS)),
  );
  await ensureCategoryExists(prisma, data.category);
  await prisma.recurringTransaction.create({
    data: { ...data, nextRunDate: data.startDate },
  });
  revalidatePath("/recurring");
}

export async function updateRecurringTransaction(id: string, formData: FormData) {
  const data = normalizeRecurringData(
    recurringSchema.parse(pickFormFields(formData, RECURRING_FIELDS)),
  );
  await prisma.recurringTransaction.update({ where: { id }, data });
  revalidatePath("/recurring");
}

export async function deleteRecurringTransaction(id: string) {
  await prisma.recurringTransaction.delete({ where: { id } });
  revalidatePath("/recurring");
}

export async function setRecurringTransactionActive(id: string, active: boolean) {
  await prisma.recurringTransaction.update({ where: { id }, data: { active } });
  revalidatePath("/recurring");
}

function advanceNextRunDate(from: Date, frequency: RecurringFrequency) {
  if (frequency === "DAILY") return addDays(from, 1);
  if (frequency === "WEEKLY") return addWeeks(from, 1);
  return addMonths(from, 1);
}

/**
 * Dipanggil cron harian (`/api/cron/run-recurring-transactions`). Per rule,
 * create transaksi + majukan `nextRunDate` ada dalam SATU transaction DB
 * (bukan dua transaction terpisah) supaya idempotent kalau invocation-nya
 * kebetulan overlap — `nextRunDate` dihitung dari nilai LAMA, bukan dari
 * `now`, supaya tidak drift kalau cron sempat telat jalan.
 */
export async function runDueRecurringTransactions() {
  const due = await prisma.recurringTransaction.findMany({
    where: { active: true, nextRunDate: { lte: new Date() } },
  });

  for (const rule of due) {
    await prisma.$transaction(async (tx) => {
      await createTransactionWithClient(tx, {
        accountId: rule.accountId,
        toAccountId: rule.toAccountId,
        type: rule.type,
        category: rule.category,
        amount: Number(rule.amount),
        date: rule.nextRunDate,
        note: rule.note ?? undefined,
        affectsBalance: rule.affectsBalance,
      });

      const nextRunDate = advanceNextRunDate(rule.nextRunDate, rule.frequency);
      const active = rule.endDate ? nextRunDate <= rule.endDate : true;
      await tx.recurringTransaction.update({
        where: { id: rule.id },
        data: { nextRunDate, active },
      });
    });
  }

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");

  return { processed: due.length };
}
