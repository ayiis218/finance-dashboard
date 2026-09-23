"use server";

import { revalidatePath } from "next/cache";
import { format } from "date-fns";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";

function revalidateCashflow(month: Date) {
  revalidatePath("/cashflow");
  revalidatePath(`/cashflow/${format(month, "yyyy-MM")}`);
  revalidatePath("/");
}

const cashflowMonthSchema = z.object({
  month: z.coerce.date(),
  saldoAwal: z.coerce.number(),
  monthlyIncome: z.coerce.number(),
  saldoAkhirActual: z.coerce.number().optional(),
});

/**
 * `saldoAkhirActual` is written explicitly (`?? null`) rather than left out
 * of the update when blank — unlike the usual `pickFormFields` pattern where
 * a blank field means "leave unchanged". Here blank means "not known yet /
 * clear what was entered before", so it must actively reset the column to
 * null instead of being silently ignored.
 */
export async function setCashflowMonth(formData: FormData) {
  const data = cashflowMonthSchema.parse(
    pickFormFields(formData, ["month", "saldoAwal", "monthlyIncome", "saldoAkhirActual"]),
  );

  await prisma.cashflowForecast.upsert({
    where: { month: data.month },
    create: {
      month: data.month,
      saldoAwal: data.saldoAwal,
      monthlyIncome: data.monthlyIncome,
      saldoAkhirActual: data.saldoAkhirActual ?? null,
    },
    update: {
      saldoAwal: data.saldoAwal,
      monthlyIncome: data.monthlyIncome,
      saldoAkhirActual: data.saldoAkhirActual ?? null,
    },
  });

  revalidateCashflow(data.month);
}

const budgetItemSchema = z.object({
  month: z.coerce.date(),
  label: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export async function createCashflowBudgetItem(formData: FormData) {
  const data = budgetItemSchema.parse(pickFormFields(formData, ["month", "label", "amount"]));

  const forecast = await prisma.cashflowForecast.upsert({
    where: { month: data.month },
    create: { month: data.month },
    update: {},
  });
  await prisma.cashflowBudgetItem.create({
    data: { forecastId: forecast.id, label: data.label, amount: data.amount },
  });

  revalidateCashflow(data.month);
}

const budgetItemUpdateSchema = budgetItemSchema.omit({ month: true });

export async function updateCashflowBudgetItem(id: string, month: Date, formData: FormData) {
  const data = budgetItemUpdateSchema.parse(pickFormFields(formData, ["label", "amount"]));
  await prisma.cashflowBudgetItem.update({ where: { id }, data });
  revalidateCashflow(month);
}

export async function deleteCashflowBudgetItem(id: string, month: Date) {
  await prisma.cashflowBudgetItem.delete({ where: { id } });
  revalidateCashflow(month);
}
