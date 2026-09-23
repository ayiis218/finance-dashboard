import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";
import { formatIDR } from "@/lib/format";

export type CashflowFormDefaults = {
  expectedDelta?: number;
  saldoAkhirActual?: number | null;
};

export function CashflowFormFields({
  idPrefix,
  month,
  monthLabel,
  saldoAwal,
  defaults,
}: Readonly<{
  idPrefix: string;
  month: string;
  monthLabel: string;
  saldoAwal: number;
  defaults?: CashflowFormDefaults;
}>) {
  return (
    <>
      <input type="hidden" name="month" value={month} />
      <p className="text-sm text-muted-foreground">
        {monthLabel} &middot; Saldo Awal (otomatis): {formatIDR(saldoAwal)}
      </p>
      <div className="space-y-2">
        <Label htmlFor={`expectedDelta-${idPrefix}`}>Rencana Bulanan</Label>
        <NumberInput
          id={`expectedDelta-${idPrefix}`}
          name="expectedDelta"
          defaultValue={defaults?.expectedDelta ?? 0}
          allowNegative
          required
        />
        <p className="text-xs text-muted-foreground">
          Ditambahkan ke Saldo Awal untuk hitung Saldo Akhir Ekspektasi. Boleh negatif kalau bulan
          ini direncanakan defisit.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`saldoAkhirActual-${idPrefix}`}>Saldo Akhir Aktual (override manual)</Label>
        <NumberInput
          id={`saldoAkhirActual-${idPrefix}`}
          name="saldoAkhirActual"
          defaultValue={defaults?.saldoAkhirActual ?? ""}
          placeholder="Kosongkan untuk ikut saldo wallet otomatis"
        />
      </div>
    </>
  );
}
