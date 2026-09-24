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

/** Ensures exactly one `CashflowAllocationTemplate` row exists and returns it with its items. */
async function getOrCreateAllocationTemplateRow() {
  const existing = await prisma.cashflowAllocationTemplate.findFirst({ include: { items: true } });
  if (existing) return existing;
  return prisma.cashflowAllocationTemplate.create({ data: {}, include: { items: true } });
}

/**
 * A month becomes independent the moment its `CashflowForecast` row is first
 * created — from then on it's fully isolated from the allocation template,
 * same as any other per-month data. If the row already exists, this is a
 * no-op read (never re-applies the template, never touches existing data).
 * If it doesn't, the template's *current* income + budget items are snapshotted
 * into new rows owned by this month, so later edits to the template have no
 * effect on it. `overrides` lets a caller (e.g. `setCashflowMonth`, which
 * collects its own income/balance from the form) supply values the user
 * explicitly submitted instead of the raw template defaults.
 */
async function materializeForecast(
  month: Date,
  overrides?: { saldoAwal?: number; monthlyIncome?: number; saldoAkhirActual?: number | null },
) {
  const existing = await prisma.cashflowForecast.findUnique({ where: { month } });
  if (existing) return { forecast: existing, justCreated: false };

  const template = await getOrCreateAllocationTemplateRow();
  const forecast = await prisma.cashflowForecast.create({
    data: {
      month,
      saldoAwal: overrides?.saldoAwal ?? 0,
      monthlyIncome: overrides?.monthlyIncome ?? template.monthlyIncome,
      saldoAkhirActual: overrides?.saldoAkhirActual ?? null,
      budgetItems: {
        create: template.items.map((i) => ({ label: i.label, amount: i.amount })),
      },
    },
  });
  return { forecast, justCreated: true };
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

  const existing = await prisma.cashflowForecast.findUnique({ where: { month: data.month } });
  if (existing) {
    await prisma.cashflowForecast.update({
      where: { id: existing.id },
      data: {
        saldoAwal: data.saldoAwal,
        monthlyIncome: data.monthlyIncome,
        saldoAkhirActual: data.saldoAkhirActual ?? null,
      },
    });
  } else {
    await materializeForecast(data.month, {
      saldoAwal: data.saldoAwal,
      monthlyIncome: data.monthlyIncome,
      saldoAkhirActual: data.saldoAkhirActual ?? null,
    });
  }

  revalidateCashflow(data.month);
}

const budgetItemSchema = z.object({
  month: z.coerce.date(),
  label: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export async function createCashflowBudgetItem(formData: FormData) {
  const data = budgetItemSchema.parse(pickFormFields(formData, ["month", "label", "amount"]));

  const { forecast } = await materializeForecast(data.month);
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

const allocationTemplateSchema = z.object({
  monthlyIncome: z.coerce.number(),
});

export async function setCashflowAllocationTemplate(formData: FormData) {
  const data = allocationTemplateSchema.parse(pickFormFields(formData, ["monthlyIncome"]));
  const template = await getOrCreateAllocationTemplateRow();
  await prisma.cashflowAllocationTemplate.update({
    where: { id: template.id },
    data: { monthlyIncome: data.monthlyIncome },
  });
  revalidatePath("/cashflow");
}

const allocationTemplateItemSchema = z.object({
  label: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export async function createAllocationTemplateItem(formData: FormData) {
  const data = allocationTemplateItemSchema.parse(pickFormFields(formData, ["label", "amount"]));
  const template = await getOrCreateAllocationTemplateRow();
  await prisma.cashflowAllocationTemplateItem.create({
    data: { templateId: template.id, label: data.label, amount: data.amount },
  });
  revalidatePath("/cashflow");
}

export async function updateAllocationTemplateItem(id: string, formData: FormData) {
  const data = allocationTemplateItemSchema.parse(pickFormFields(formData, ["label", "amount"]));
  await prisma.cashflowAllocationTemplateItem.update({ where: { id }, data });
  revalidatePath("/cashflow");
}

export async function deleteAllocationTemplateItem(id: string) {
  await prisma.cashflowAllocationTemplateItem.delete({ where: { id } });
  revalidatePath("/cashflow");
}
