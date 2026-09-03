import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { NumberInput } from "@/components/number-input";

type Account = { id: string; name: string };

export type TransactionFormDefaults = {
  accountId?: string;
  toAccountId?: string | null;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount?: number;
  date?: string;
  note?: string | null;
  affectsBalance?: boolean;
};

export function TransactionFormFields({
  idPrefix,
  accounts,
  categories,
  defaults,
}: Readonly<{
  idPrefix: string;
  accounts: Account[];
  categories: string[];
  defaults?: TransactionFormDefaults;
}>) {
  const datalistId = `category-suggestions-${idPrefix}`;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`accountId-${idPrefix}`}>Rekening</Label>
        <select
          id={`accountId-${idPrefix}`}
          name="accountId"
          defaultValue={defaults?.accountId}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`type-${idPrefix}`}>Tipe</Label>
        <select
          id={`type-${idPrefix}`}
          name="type"
          defaultValue={defaults?.type}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          <option value="EXPENSE">Pengeluaran</option>
          <option value="INCOME">Pemasukan</option>
          <option value="TRANSFER">Transfer</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`toAccountId-${idPrefix}`}>Rekening Tujuan (khusus Transfer)</Label>
        <select
          id={`toAccountId-${idPrefix}`}
          name="toAccountId"
          defaultValue={defaults?.toAccountId ?? ""}
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          <option value="">— Tidak ada (transfer ke luar) —</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          Isi kalau tipe Transfer dan uangnya masuk ke rekening lain di sistem ini (mis. tarik
          tunai ke Cash Tunai).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`category-${idPrefix}`}>Kategori</Label>
        <Input
          id={`category-${idPrefix}`}
          name="category"
          list={datalistId}
          defaultValue={defaults?.category}
          placeholder="Makan, Bensin, dll"
          required
        />
        <datalist id={datalistId}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`amount-${idPrefix}`}>Jumlah</Label>
        <NumberInput id={`amount-${idPrefix}`} name="amount" defaultValue={defaults?.amount} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`date-${idPrefix}`}>Tanggal</Label>
        <Input
          id={`date-${idPrefix}`}
          name="date"
          type="date"
          defaultValue={defaults?.date ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`note-${idPrefix}`}>Catatan</Label>
        <Input
          id={`note-${idPrefix}`}
          name="note"
          defaultValue={defaults?.note ?? ""}
          placeholder="Opsional"
        />
      </div>
      <div className="space-y-1.5">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox
            name="affectsBalance"
            defaultChecked={defaults?.affectsBalance ?? true}
          />
          Transaksi ini mengubah saldo rekening
        </label>
        <p className="pl-6 text-xs text-muted-foreground">
          Aktif = saldo rekening otomatis bertambah/berkurang sesuai jumlah di atas. Matikan
          kalau ini cuma catatan historis dan saldo rekening tidak boleh berubah.
        </p>
      </div>
    </>
  );
}
