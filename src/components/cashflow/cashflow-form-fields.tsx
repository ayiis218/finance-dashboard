import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type CashflowFormDefaults = {
  saldoAwal?: number;
  saldoAkhirExpected?: number | null;
  saldoAkhirActual?: number | null;
};

export function CashflowFormFields({
  idPrefix,
  defaults,
  monthLabel,
}: Readonly<{
  idPrefix: string;
  defaults?: CashflowFormDefaults;
  /** Provide when editing (month is fixed, shown as read-only text). Omit for create (renders the month input). */
  monthLabel?: string;
}>) {
  return (
    <>
      {monthLabel ? (
        <p className="text-sm text-muted-foreground">Bulan: {monthLabel}</p>
      ) : (
        <div className="space-y-2">
          <Label htmlFor={`month-${idPrefix}`}>Bulan</Label>
          <Input id={`month-${idPrefix}`} name="month" type="month" required />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`saldoAwal-${idPrefix}`}>Saldo Awal</Label>
        <NumberInput
          id={`saldoAwal-${idPrefix}`}
          name="saldoAwal"
          defaultValue={defaults?.saldoAwal}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`saldoAkhirExpected-${idPrefix}`}>Saldo Akhir (Ekspektasi)</Label>
        <NumberInput
          id={`saldoAkhirExpected-${idPrefix}`}
          name="saldoAkhirExpected"
          defaultValue={defaults?.saldoAkhirExpected ?? ""}
          placeholder="Opsional"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`saldoAkhirActual-${idPrefix}`}>Saldo Akhir (Aktual)</Label>
        <NumberInput
          id={`saldoAkhirActual-${idPrefix}`}
          name="saldoAkhirActual"
          defaultValue={defaults?.saldoAkhirActual ?? ""}
          placeholder="Opsional"
        />
      </div>
    </>
  );
}
