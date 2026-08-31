import { parse, isValid } from "date-fns";

export const IMPORT_CSV_HEADERS = [
  "tanggal",
  "rekening",
  "tipe",
  "kategori",
  "jumlah",
  "catatan",
] as const;

const TYPE_ALIASES: Record<string, "INCOME" | "EXPENSE" | "TRANSFER"> = {
  income: "INCOME",
  pemasukan: "INCOME",
  expense: "EXPENSE",
  pengeluaran: "EXPENSE",
  transfer: "TRANSFER",
};

export type ImportAccount = { id: string; name: string };

export type ParsedImportRow = {
  accountId: string;
  accountName: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category: string;
  amount: number;
  date: Date;
  note?: string;
};

export type ValidationResult =
  | { ok: true; index: number; raw: Record<string, string>; row: ParsedImportRow }
  | { ok: false; index: number; raw: Record<string, string>; error: string };

export function headersMatch(fields: string[] | undefined): boolean {
  if (!fields) return false;
  const normalized = fields.map((f) => f.trim().toLowerCase());
  return (
    normalized.length === IMPORT_CSV_HEADERS.length &&
    IMPORT_CSV_HEADERS.every((h, i) => normalized[i] === h)
  );
}

export function validateImportRow(
  raw: Record<string, string>,
  accounts: ImportAccount[],
  index: number,
): ValidationResult {
  const tanggal = (raw.tanggal ?? "").trim();
  const rekening = (raw.rekening ?? "").trim();
  const tipe = (raw.tipe ?? "").trim();
  const kategori = (raw.kategori ?? "").trim();
  const jumlah = (raw.jumlah ?? "").trim();
  const catatan = (raw.catatan ?? "").trim();

  const date = parse(tanggal, "yyyy-MM-dd", new Date());
  if (!tanggal || !isValid(date)) {
    return { ok: false, index, raw, error: `Tanggal tidak valid: "${tanggal}" (format harus YYYY-MM-DD)` };
  }

  const account = accounts.find((a) => a.name.trim().toLowerCase() === rekening.toLowerCase());
  if (!rekening || !account) {
    return { ok: false, index, raw, error: `Rekening tidak ditemukan: "${rekening}"` };
  }

  const type = TYPE_ALIASES[tipe.toLowerCase()];
  if (!type) {
    return {
      ok: false,
      index,
      raw,
      error: `Tipe tidak valid: "${tipe}" (harus INCOME/EXPENSE/TRANSFER atau Pemasukan/Pengeluaran/Transfer)`,
    };
  }

  if (!kategori) {
    return { ok: false, index, raw, error: "Kategori tidak boleh kosong" };
  }

  if (/[.,]/.test(jumlah)) {
    return {
      ok: false,
      index,
      raw,
      error: `Jumlah tidak boleh pakai pemisah ribuan/desimal: "${jumlah}" (tulis mis. 150000)`,
    };
  }
  const amount = Number(jumlah);
  if (!jumlah || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, index, raw, error: `Jumlah harus angka positif: "${jumlah}"` };
  }

  return {
    ok: true,
    index,
    raw,
    row: {
      accountId: account.id,
      accountName: account.name,
      type,
      category: kategori,
      amount,
      date,
      note: catatan || undefined,
    },
  };
}
