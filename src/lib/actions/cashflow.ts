"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

const cashflowForecastSchema = z.object({
  month: z.coerce.date(),
  saldoAwal: z.coerce.number(),
  saldoAkhirActual: z.coerce.number().optional(),
  saldoAkhirExpected: z.coerce.number().optional(),
});

const cashflowForecastUpdateSchema = cashflowForecastSchema.omit({
  month: true,
});

const CASHFLOW_BALANCE_FIELDS = ["saldoAwal", "saldoAkhirActual", "saldoAkhirExpected"] as const;

export async function createCashflowForecast(formData: FormData) {
  const data = cashflowForecastSchema.parse(
    pickFormFields(formData, ["month", ...CASHFLOW_BALANCE_FIELDS]),
  );
  await prisma.cashflowForecast.create({ data });
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function updateCashflowForecast(id: string, formData: FormData) {
  const data = cashflowForecastUpdateSchema.parse(
    pickFormFields(formData, CASHFLOW_BALANCE_FIELDS),
  );
  await prisma.cashflowForecast.update({ where: { id }, data });
  revalidatePath("/cashflow");
  revalidatePath("/");
}

export async function deleteCashflowForecast(id: string) {
  await prisma.cashflowForecast.delete({ where: { id } });
  revalidatePath("/cashflow");
  revalidatePath("/");
}
