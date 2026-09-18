"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const receivableSchema = z.object({
  personName: z.string().min(1),
  amount: z.coerce.number().positive(),
  type: z.enum(["PIUTANG", "UTANG"]),
  date: z.coerce.date(),
  note: z.string().optional(),
});

const RECEIVABLE_FIELDS = ["personName", "amount", "type", "date", "note"] as const;

export async function createReceivable(formData: FormData) {
  const data = receivableSchema.parse(pickFormFields(formData, RECEIVABLE_FIELDS));
  await prisma.receivable.create({ data });
  revalidatePath("/receivables");
  revalidatePath("/");
}

export async function updateReceivable(id: string, formData: FormData) {
  const data = receivableSchema.parse(pickFormFields(formData, RECEIVABLE_FIELDS));
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
  const data = repaymentEntrySchema.parse(
    pickFormFields(formData, ["receivableId", "date", "amount", "note"]),
  );
  await prisma.repaymentEntry.create({ data });
  revalidatePath("/receivables");
}

export async function deleteRepaymentEntry(id: string) {
  await prisma.repaymentEntry.delete({ where: { id } });
  revalidatePath("/receivables");
}
