import { MAX_AMOUNT } from "@/lib/transaction-cashier/flow";

/**
 * Logika murni isian jumlah pada keypad kasir.
 *
 * `pristine` = nilai sekarang datang dari nominal cepat atau dari jawaban
 * sebelumnya (bukan diketik user). Angka pertama yang ditekan sesudahnya
 * MENGGANTI nilai itu, tidak menempel — kalau menempel, "Rp 25.000" + "5"
 * menjadi 250.005 dan "000" menjadi 25.000.000.
 */
export type AmountEntry = { digits: string; pristine: boolean };

const MAX_DIGITS = String(MAX_AMOUNT).length;

export const EMPTY_ENTRY: AmountEntry = { digits: "", pristine: false };

const normalize = (digits: string) => digits.replace(/^0+/, "").slice(0, MAX_DIGITS);

export function amountOf(entry: AmountEntry): number {
  return Number(entry.digits || 0);
}

/** Mengisi ulang dari jawaban sebelumnya (mis. saat Kembali atau Ubah); kosong bila belum ada. */
export function entryFromAmount(amount: number | undefined): AmountEntry {
  return amount !== undefined && amount > 0 ? { digits: String(amount), pristine: true } : EMPTY_ENTRY;
}

export function pressPreset(value: number): AmountEntry {
  return { digits: String(value), pristine: true };
}

export function pressKey(entry: AmountEntry, key: string): AmountEntry {
  const base = entry.pristine ? "" : entry.digits;
  return { digits: normalize(base + key), pristine: false };
}

export function erase(entry: AmountEntry): AmountEntry {
  return { digits: entry.digits.slice(0, -1), pristine: false };
}

export function clear(): AmountEntry {
  return EMPTY_ENTRY;
}

/** Nominal cepat yang sedang terpilih (belum diubah), untuk ditandai di layar. */
export function selectedPreset(entry: AmountEntry, presets: readonly number[]): number | null {
  const amount = amountOf(entry);
  return entry.pristine && presets.includes(amount) ? amount : null;
}
