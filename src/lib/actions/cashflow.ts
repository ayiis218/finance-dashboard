"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const cashflowPlanSchema = z.object({
  month: z.coerce.date(),
  expectedDelta: z.coerce.number(),
  saldoAkhirActual: z.coerce.number().optional(),
});

/**
 * `saldoAkhirActual` is written explicitly (`?? null`) rather than left out
 * of the update when blank — unlike the usual `pickFormFields` pattern where
 * a blank field means "leave unchanged". Here blank means "clear the manual
 * override and go back to the live wallet sync", so it must actively reset
 * the column to null instead of being silently ignored.
 */
export async function setCashflowMonthPlan(formData: FormData) {
  const data = cashflowPlanSchema.parse(
    pickFormFields(formData, ["month", "expectedDelta", "saldoAkhirActual"]),
  );

  await prisma.cashflowForecast.upsert({
    where: { month: data.month },
    create: {
      month: data.month,
      expectedDelta: data.expectedDelta,
      saldoAkhirActual: data.saldoAkhirActual ?? null,
    },
    update: {
      expectedDelta: data.expectedDelta,
      saldoAkhirActual: data.saldoAkhirActual ?? null,
    },
  });

  revalidatePath("/cashflow");
  revalidatePath("/");
}
