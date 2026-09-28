"use server";

import { revalidatePath } from "next/cache";
import { addDays, addMonths, addWeeks } from "date-fns";
import { z } from "zod";
import type { RecurringFrequency } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { pickFormFields } from "@/lib/form-data";
import { createTransactionWithClient } from "@/lib/actions/transactions";
import { ensureCategoryExists } from "@/lib/actions/categories";

const recurringSchema = z.object({
  accountId: z.string().min(1),
  toAccountId: z.string().optional(),
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  category: z.string().min(1),
  amount: z.coerce.number().positive(),
  note: z.string().optional(),
  affectsBalance: z.string().optional().transform((v) => v === "on"),
  frequency: z.enum(["DAILY", "WEEKLY", "MONTHLY"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

const RECURRING_FIELDS = [
  "accountId",
  "toAccountId",
  "type",
  "category",
  "amount",
  "note",
  "affectsBalance",
  "frequency",
  "startDate",
  "endDate",
] as const;

/** Sama seperti `normalizeTransactionData` di transactions.ts — `toAccountId` cuma valid untuk TRANSFER. */
function normalizeRecurringData<T extends z.infer<typeof recurringSchema>>(data: T) {
  const toAccountId = data.type === "TRANSFER" ? (data.toAccountId ?? null) : null;
  if (toAccountId && toAccountId === data.accountId) {
    throw new Error("Rekening tujuan tidak boleh sama dengan rekening asal.");
  }
  if (data.endDate && data.endDate < data.startDate) {
    throw new Error("End Date tidak boleh lebih awal dari Start Date.");
  }
  return { ...data, toAccountId };
}

export async function createRecurringTransaction(formData: FormData) {
  const data = normalizeRecurringData(
    recurringSchema.parse(pickFormFields(formData, RECURRING_FIELDS)),
  );
  await ensureCategoryExists(prisma, data.category);
  await prisma.recurringTransaction.create({
    data: { ...data, nextRunDate: data.startDate },
  });
  revalidatePath("/recurring");
}

export async function updateRecurringTransaction(id: string, formData: FormData) {
  const data = normalizeRecurringData(
    recurringSchema.parse(pickFormFields(formData, RECURRING_FIELDS)),
  );
  await prisma.recurringTransaction.update({ where: { id }, data });
  revalidatePath("/recurring");
}

export async function deleteRecurringTransaction(id: string) {
  await prisma.recurringTransaction.delete({ where: { id } });
  revalidatePath("/recurring");
}

export async function setRecurringTransactionActive(id: string, active: boolean) {
  await prisma.recurringTransaction.update({ where: { id }, data: { active } });
  revalidatePath("/recurring");
}

function advanceNextRunDate(from: Date, frequency: RecurringFrequency) {
  if (frequency === "DAILY") return addDays(from, 1);
  if (frequency === "WEEKLY") return addWeeks(from, 1);
  return addMonths(from, 1);
}

/**
 * Kunci arbitrer tapi tetap (advisory lock Postgres) — hanya dipakai supaya
 * dua invocation `runDueRecurringTransactions` yang overlap (cron terjadwal
 * ketiban trigger manual, atau retry Vercel) tidak dobel memproses rule yang
 * sama. Angka ini tidak berarti apa-apa selain "identitas lock ini".
 */
const RECURRING_CRON_LOCK_KEY = 851100230;

/**
 * Dipanggil cron harian (`/api/cron/run-recurring-transactions`). Seluruh
 * batch (bukan per-rule) sekarang jalan di dalam SATU transaction DB, dibuka
 * dengan `pg_try_advisory_xact_lock` — kalau invocation lain sedang pegang
 * lock yang sama, invocation ini keluar lebih awal (`skipped: true`) alih-alih
 * ikut memproses rule yang sama dan menghasilkan transaksi dobel. Lock ini
 * transaction-scoped (bukan session-scoped) supaya otomatis lepas begitu
 * transaction selesai/timeout, tidak mungkin nyangkut.
 *
 * Konsekuensi dari "satu transaction untuk semua rule": kalau salah satu
 * rule gagal (mis. account-nya sudah dihapus), SEMUA rule di batch ini ikut
 * rollback, bukan cuma yang gagal — lebih aman daripada sebagian silent-fail
 * tanpa retry, karena batch berikutnya besok akan mencoba lagi dari awal.
 */
export async function runDueRecurringTransactions() {
  const result = await prisma.$transaction(
    async (tx) => {
      const [{ locked }] = await tx.$queryRaw<{ locked: boolean }[]>`
        SELECT pg_try_advisory_xact_lock(${RECURRING_CRON_LOCK_KEY}) as locked
      `;
      if (!locked) {
        return { processed: 0, skipped: true as const };
      }

      const due = await tx.recurringTransaction.findMany({
        where: { active: true, nextRunDate: { lte: new Date() } },
      });

      for (const rule of due) {
        await createTransactionWithClient(tx, {
          accountId: rule.accountId,
          toAccountId: rule.toAccountId,
          type: rule.type,
          category: rule.category,
          amount: Number(rule.amount),
          date: rule.nextRunDate,
          note: rule.note ?? undefined,
          affectsBalance: rule.affectsBalance,
        });

        const nextRunDate = advanceNextRunDate(rule.nextRunDate, rule.frequency);
        const active = rule.endDate ? nextRunDate <= rule.endDate : true;
        await tx.recurringTransaction.update({
          where: { id: rule.id },
          data: { nextRunDate, active },
        });
      }

      return { processed: due.length, skipped: false as const };
    },
    { timeout: 20000 },
  );

  if (result.processed > 0) {
    revalidatePath("/transactions");
    revalidatePath("/accounts");
    revalidatePath("/");
  }

  return result;
}
