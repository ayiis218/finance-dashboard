/**
 * Fungsi murni (tanpa "use server", tanpa DB) — sengaja dipisah dari
 * `src/lib/actions/transactions.ts` karena file itu `"use server"` dan Next.js
 * mewajibkan SETIAP export dari file begitu jadi async Server Action, jadi
 * helper sinkron seperti ini tidak bisa diexport langsung dari sana.
 *
 * `toAccountId` cuma valid untuk TRANSFER — untuk INCOME/EXPENSE dipaksa
 * `null` apapun yang disubmit form, supaya nilai basi dari ganti-ganti
 * dropdown type tidak kebawa ke storage.
 *
 * `note` dinormalisasi ke `null` (tidak pernah dibiarkan `undefined`):
 * `pickFormFields` mengubah textarea kosong jadi `undefined`, dan Prisma
 * `update` melewati field `undefined` sama sekali ("jangan sentuh kolom
 * ini") alih-alih mengosongkannya. Tanpa ini, menghapus note yang sudah ada
 * lalu save melaporkan sukses tapi diam-diam meninggalkan note lama.
 */
export function normalizeTransactionData<
  T extends {
    accountId: string;
    toAccountId?: string;
    type: "INCOME" | "EXPENSE" | "TRANSFER";
    note?: string;
  },
>(
  data: T,
): Omit<T, "toAccountId" | "note"> & { toAccountId: string | null; note: string | null } {
  const toAccountId = data.type === "TRANSFER" ? (data.toAccountId ?? null) : null;
  if (toAccountId && toAccountId === data.accountId) {
    throw new Error("Rekening tujuan tidak boleh sama dengan rekening asal.");
  }
  return { ...data, toAccountId, note: data.note ?? null };
}
