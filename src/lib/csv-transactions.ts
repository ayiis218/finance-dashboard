export const IMPORT_CSV_HEADERS = [
  "tanggal",
  "rekening",
  "tipe",
  "kategori",
  "jumlah",
  "catatan",
  "rekening_tujuan",
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
  toAccountId?: string;
  toAccountName?: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category: string;
  amount: number;
  date: Date;
  note?: string;
};

export type ValidationResult =
  | { ok: true; index: number; raw: Record<string, string>; row: ParsedImportRow }
  | { ok: false; index: number; raw: Record<string, string>; error: string };

/**
 * Parses "yyyy-MM-dd" or "dd/MM/yyyy" into a UTC-midnight Date, anchored to
 * the calendar day regardless of the runtime's local timezone. date-fns'
 * `parse()` treats date-only strings as LOCAL midnight, which for a WIB
 * (UTC+7) browser shifts the underlying UTC instant back onto the previous
 * calendar day — surfacing as an off-by-one when later rendered on a
 * UTC-timezone server. Native `new Date("yyyy-MM-dd")` already does the
 * right thing (UTC midnight per the ES spec), so this matches that
 * convention instead of introducing a different one for CSV-parsed dates.
 */
function parseCsvDate(value: string): Date | null {
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const idMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);

  let year: number;
  let month: number;
  let day: number;
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  } else if (idMatch) {
    day = Number(idMatch[1]);
    month = Number(idMatch[2]);
    year = Number(idMatch[3]);
  } else {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  const roundTrips =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  return roundTrips ? date : null;
}

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
  const dateStr = (raw.tanggal ?? "").trim();
  const accountName = (raw.rekening ?? "").trim();
  const typeStr = (raw.tipe ?? "").trim();
  const categoryStr = (raw.kategori ?? "").trim();
  const amountStr = (raw.jumlah ?? "").trim();
  const noteStr = (raw.catatan ?? "").trim();
  const toAccountName = (raw.rekening_tujuan ?? "").trim();

  const date = dateStr ? parseCsvDate(dateStr) : null;
  if (!date) {
    return {
      ok: false,
      index,
      raw,
      error: `Tanggal tidak valid: "${dateStr}" (format harus YYYY-MM-DD atau DD/MM/YYYY)`,
    };
  }

  const account = accounts.find((a) => a.name.trim().toLowerCase() === accountName.toLowerCase());
  if (!accountName || !account) {
    return { ok: false, index, raw, error: `Rekening tidak ditemukan: "${accountName}"` };
  }

  const type = TYPE_ALIASES[typeStr.toLowerCase()];
  if (!type) {
    return {
      ok: false,
      index,
      raw,
      error: `Tipe tidak valid: "${typeStr}" (harus INCOME/EXPENSE/TRANSFER atau Pemasukan/Pengeluaran/Transfer)`,
    };
  }

  if (!categoryStr) {
    return { ok: false, index, raw, error: "Kategori tidak boleh kosong" };
  }

  let toAccount: ImportAccount | undefined;
  if (toAccountName) {
    toAccount = accounts.find((a) => a.name.trim().toLowerCase() === toAccountName.toLowerCase());
    if (!toAccount) {
      return {
        ok: false,
        index,
        raw,
        error: `Rekening tujuan tidak ditemukan: "${toAccountName}"`,
      };
    }
    if (toAccount.id === account.id) {
      return {
        ok: false,
        index,
        raw,
        error: "Rekening tujuan tidak boleh sama dengan rekening asal",
      };
    }
  }

  if (/[.,]/.test(amountStr)) {
    return {
      ok: false,
      index,
      raw,
      error: `Jumlah tidak boleh pakai pemisah ribuan/desimal: "${amountStr}" (tulis mis. 150000)`,
    };
  }
  const amount = Number(amountStr);
  if (!amountStr || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, index, raw, error: `Jumlah harus angka positif: "${amountStr}"` };
  }

  return {
    ok: true,
    index,
    raw,
    row: {
      accountId: account.id,
      accountName: account.name,
      toAccountId: type === "TRANSFER" ? toAccount?.id : undefined,
      toAccountName: type === "TRANSFER" ? toAccount?.name : undefined,
      type,
      category: categoryStr,
      amount,
      date,
      note: noteStr || undefined,
    },
  };
}
