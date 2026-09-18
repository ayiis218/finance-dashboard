"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const investmentSchema = z.object({
  platform: z.string().min(1),
  name: z.string().min(1),
  buyValue: z.coerce.number(),
  currentValue: z.coerce.number(),
});

const INVESTMENT_FIELDS = ["platform", "name", "buyValue", "currentValue"] as const;

export async function createInvestment(formData: FormData) {
  const data = investmentSchema.parse(pickFormFields(formData, INVESTMENT_FIELDS));
  await prisma.investment.create({ data });
  revalidatePath("/investments");
  revalidatePath("/");
}

export async function updateInvestment(id: string, formData: FormData) {
  const data = investmentSchema.parse(pickFormFields(formData, INVESTMENT_FIELDS));
  await prisma.investment.update({ where: { id }, data });
  revalidatePath("/investments");
  revalidatePath("/");
}

export async function deleteInvestment(id: string) {
  await prisma.investment.delete({ where: { id } });
  revalidatePath("/investments");
  revalidatePath("/");
}
