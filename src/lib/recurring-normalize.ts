/**
 * Fungsi murni (tanpa "use server", tanpa DB) — dipisah dari
 * `src/lib/actions/recurring-transactions.ts` dengan alasan yang sama persis
 * seperti `transaction-normalize.ts`: file itu `"use server"`, dan Next.js
 * mewajibkan setiap export dari file begitu jadi async Server Action.
 *
 * `toAccountId`/`note` dinormalisasi sama seperti versi transaksi biasa.
 * `endDate` juga di-null-kan (bukan dibiarkan `undefined`) dengan alasan
 * yang sama: form yang dikosongkan harus benar-benar mengosongkan kolomnya,
 * bukan diam-diam meninggalkan nilai lama.
 */
export function normalizeRecurringData<
  T extends {
    accountId: string;
    toAccountId?: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    note?: string;
    startDate: Date;
    endDate?: Date;
  },
>(
  data: T,
): Omit<T, "toAccountId" | "note" | "endDate"> & {
  toAccountId: string | null;
  note: string | null;
  endDate: Date | null;
} {
  const toAccountId = data.type === "TRANSFER" ? (data.toAccountId ?? null) : null;
  if (toAccountId && toAccountId === data.accountId) {
    throw new Error("Rekening tujuan tidak boleh sama dengan rekening asal.");
  }
  if (data.endDate && data.endDate < data.startDate) {
    throw new Error("End Date tidak boleh lebih awal dari Start Date.");
  }
  return { ...data, toAccountId, note: data.note ?? null, endDate: data.endDate ?? null };
}
