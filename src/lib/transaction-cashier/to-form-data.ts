import type { CompleteDraft } from "@/lib/transaction-cashier/flow";

/**
 * Mengubah draft percakapan jadi `FormData` yang sama persis dengan yang dikirim
 * form "Add Transaction", supaya `createTransaction` (zod, normalisasi, saldo
 * rekening, kategori baru) dipakai ulang tanpa logika simpan kedua.
 */
export function toFormData(draft: CompleteDraft, requestId: string): FormData {
  const formData = new FormData();
  // Menjadi `Transaction.id`: percobaan ulang dengan id yang sama tidak membuat baris kedua.
  formData.set("id", requestId);
  formData.set("type", draft.type);
  formData.set("accountId", draft.accountId);
  if (draft.toAccountId) formData.set("toAccountId", draft.toAccountId);
  formData.set("category", draft.category);
  formData.set("amount", String(draft.amount));
  formData.set("date", draft.date);
  if (draft.note) formData.set("note", draft.note);
  // Checkbox form lama default-nya aktif; chat selalu memengaruhi saldo.
  formData.set("affectsBalance", "on");
  return formData;
}
