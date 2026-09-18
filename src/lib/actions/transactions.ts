"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const transactionSchema = z.object({
  accountId: z.string().min(1),
  toAccountId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  note: z.string().optional(),
  affectsBalance: z.string().optional().transform((v) => v === "on"),
});

const TRANSACTION_FIELDS = [
  "accountId",
  "toAccountId",
  "type",
  "category",
  "amount",
  "date",
  "note",
  "affectsBalance",
] as const;

/**
 * `toAccountId` only makes sense for TRANSFER — for INCOME/EXPENSE it's
 * forced to `null` regardless of what the form submitted, so a stale value
 * left over from switching the type dropdown never leaks into storage.
 */
function normalizeTransactionData<T extends z.infer<typeof transactionSchema>>(data: T) {
  const toAccountId = data.type === "TRANSFER" ? (data.toAccountId ?? null) : null;
  if (toAccountId && toAccountId === data.accountId) {
    throw new Error("Rekening tujuan tidak boleh sama dengan rekening asal.");
  }
  return { ...data, toAccountId };
}

export async function createTransaction(formData: FormData) {
  const data = normalizeTransactionData(
    transactionSchema.parse(pickFormFields(formData, TRANSACTION_FIELDS)),
  );

  await prisma.$transaction(async (tx) => {
    await tx.transaction.create({ data });
    const delta = data.type === "INCOME" ? data.amount : -data.amount;
    if (data.affectsBalance) {
      await tx.bankAccount.update({
        where: { id: data.accountId },
        data: { balance: { increment: delta } },
      });
      if (data.type === "TRANSFER" && data.toAccountId) {
        await tx.bankAccount.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      }
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function updateTransaction(id: string, formData: FormData) {
  const data = normalizeTransactionData(
    transactionSchema.parse(pickFormFields(formData, TRANSACTION_FIELDS)),
  );

  await prisma.$transaction(async (tx) => {
    const old = await tx.transaction.findUniqueOrThrow({ where: { id } });

    if (old.affectsBalance) {
      const oldDelta = old.type === "INCOME" ? Number(old.amount) : -Number(old.amount);
      await tx.bankAccount.update({
        where: { id: old.accountId },
        data: { balance: { decrement: oldDelta } },
      });
      if (old.type === "TRANSFER" && old.toAccountId) {
        await tx.bankAccount.update({
          where: { id: old.toAccountId },
          data: { balance: { decrement: Number(old.amount) } },
        });
      }
    }

    await tx.transaction.update({ where: { id }, data });

    if (data.affectsBalance) {
      const newDelta = data.type === "INCOME" ? data.amount : -data.amount;
      await tx.bankAccount.update({
        where: { id: data.accountId },
        data: { balance: { increment: newDelta } },
      });
      if (data.type === "TRANSFER" && data.toAccountId) {
        await tx.bankAccount.update({
          where: { id: data.toAccountId },
          data: { balance: { increment: data.amount } },
        });
      }
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteTransaction(id: string) {
  await prisma.$transaction(async (tx) => {
    const old = await tx.transaction.findUniqueOrThrow({ where: { id } });
    if (old.affectsBalance) {
      const oldDelta = old.type === "INCOME" ? Number(old.amount) : -Number(old.amount);
      await tx.bankAccount.update({
        where: { id: old.accountId },
        data: { balance: { decrement: oldDelta } },
      });
      if (old.type === "TRANSFER" && old.toAccountId) {
        await tx.bankAccount.update({
          where: { id: old.toAccountId },
          data: { balance: { decrement: Number(old.amount) } },
        });
      }
    }
    await tx.transaction.delete({ where: { id } });
  });
  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");
}

const importRowSchema = z.object({
  accountId: z.string().min(1),
  toAccountId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  date: z.coerce.date(),
  note: z.string().optional(),
});

const importRowsSchema = z.array(importRowSchema).min(1).max(2000);

/**
 * `skipBalanceUpdate: true` records rows as history only (e.g. backfilling a
 * year of past transactions) and leaves every account balance untouched;
 * `false` (default) applies each row's delta just like a manual entry would.
 */
export async function importTransactions(
  rows: z.infer<typeof importRowSchema>[],
  options?: { skipBalanceUpdate?: boolean },
) {
  const data = importRowsSchema.parse(rows).map((r) => ({
    ...r,
    toAccountId: r.type === "TRANSFER" ? (r.toAccountId ?? null) : null,
  }));
  const skipBalanceUpdate = options?.skipBalanceUpdate ?? false;

  for (const r of data) {
    if (r.toAccountId && r.toAccountId === r.accountId) {
      throw new Error("Rekening tujuan tidak boleh sama dengan rekening asal.");
    }
  }

  const accountIds = [
    ...new Set(data.flatMap((r) => (r.toAccountId ? [r.accountId, r.toAccountId] : [r.accountId]))),
  ];
  const accounts = await prisma.bankAccount.findMany({
    where: { id: { in: accountIds } },
  });
  if (accounts.length !== accountIds.length) {
    throw new Error("Beberapa rekening pada data import tidak ditemukan.");
  }

  const deltaByAccount = new Map<string, number>();
  if (!skipBalanceUpdate) {
    for (const r of data) {
      const delta = r.type === "INCOME" ? r.amount : -r.amount;
      deltaByAccount.set(r.accountId, (deltaByAccount.get(r.accountId) ?? 0) + delta);
      if (r.type === "TRANSFER" && r.toAccountId) {
        deltaByAccount.set(r.toAccountId, (deltaByAccount.get(r.toAccountId) ?? 0) + r.amount);
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.transaction.createMany({
      data: data.map((r) => ({
        accountId: r.accountId,
        toAccountId: r.toAccountId,
        type: r.type,
        category: r.category,
        amount: r.amount,
        date: r.date,
        note: r.note,
        affectsBalance: !skipBalanceUpdate,
      })),
    });
    for (const [accountId, delta] of deltaByAccount) {
      await tx.bankAccount.update({
        where: { id: accountId },
        data: { balance: { increment: delta } },
      });
    }
  });

  revalidatePath("/transactions");
  revalidatePath("/accounts");
  revalidatePath("/");

  return { imported: data.length };
}
