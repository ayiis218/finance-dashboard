"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const entrySchema = z.object({
  investmentId: z.string().min(1),
  month: z.coerce.date(),
  amount: z.coerce.number().positive(),
});

const ENTRY_FIELDS = ["investmentId", "month", "amount"] as const;

export async function createInvestmentEntry(formData: FormData) {
  const data = entrySchema.parse(pickFormFields(formData, ENTRY_FIELDS));
  await prisma.$transaction([
    prisma.investmentEntry.create({ data }),
    prisma.investment.update({
      where: { id: data.investmentId },
      data: {
        buyValue: { increment: data.amount },
        currentValue: { increment: data.amount },
      },
    }),
  ]);
  revalidatePath("/investments");
  revalidatePath("/");
}

export async function updateInvestmentEntry(id: string, formData: FormData) {
  const data = entrySchema.parse(pickFormFields(formData, ENTRY_FIELDS));
  const existing = await prisma.investmentEntry.findUniqueOrThrow({ where: { id } });
  const oldAmount = Number(existing.amount);

  const ops: Prisma.PrismaPromise<unknown>[] = [
    prisma.investmentEntry.update({ where: { id }, data }),
  ];

  if (existing.investmentId === data.investmentId) {
    const delta = data.amount - oldAmount;
    ops.push(
      prisma.investment.update({
        where: { id: data.investmentId },
        data: { buyValue: { increment: delta }, currentValue: { increment: delta } },
      }),
    );
  } else {
    ops.push(
      prisma.investment.update({
        where: { id: existing.investmentId },
        data: { buyValue: { decrement: oldAmount }, currentValue: { decrement: oldAmount } },
      }),
      prisma.investment.update({
        where: { id: data.investmentId },
        data: { buyValue: { increment: data.amount }, currentValue: { increment: data.amount } },
      }),
    );
  }

  await prisma.$transaction(ops);
  revalidatePath("/investments");
  revalidatePath("/");
}

export async function deleteInvestmentEntry(id: string) {
  const existing = await prisma.investmentEntry.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.investment.update({
      where: { id: existing.investmentId },
      data: {
        buyValue: { decrement: existing.amount },
        currentValue: { decrement: existing.amount },
      },
    }),
    prisma.investmentEntry.delete({ where: { id } }),
  ]);
  revalidatePath("/investments");
  revalidatePath("/");
}
