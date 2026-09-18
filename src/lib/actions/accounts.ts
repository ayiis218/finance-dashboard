"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const bankAccountSchema = z.object({
  name: z.string().min(1),
  balance: z.coerce.number(),
});

export async function createBankAccount(formData: FormData) {
  const data = bankAccountSchema.parse(pickFormFields(formData, ["name", "balance"]));
  await prisma.bankAccount.create({ data });
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function updateBankAccount(id: string, formData: FormData) {
  const data = bankAccountSchema.parse(pickFormFields(formData, ["name", "balance"]));
  await prisma.bankAccount.update({ where: { id }, data });
  revalidatePath("/accounts");
  revalidatePath("/");
}

export async function deleteBankAccount(id: string) {
  await prisma.bankAccount.delete({ where: { id } });
  revalidatePath("/accounts");
  revalidatePath("/");
}
