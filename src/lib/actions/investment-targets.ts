"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const targetSchema = z.object({
  year: z.coerce.number().int(),
  targetAmount: z.coerce.number().positive(),
});

const TARGET_FIELDS = ["year", "targetAmount"] as const;

export async function setInvestmentYearlyTarget(formData: FormData) {
  const data = targetSchema.parse(pickFormFields(formData, TARGET_FIELDS));
  await prisma.investmentYearlyTarget.upsert({
    where: { year: data.year },
    create: data,
    update: { targetAmount: data.targetAmount },
  });
  revalidatePath("/investments");
}
