import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";

export type CashflowFormDefaults = {
  saldoAwal?: number;
  monthlyIncome?: number;
  saldoAkhirActual?: number | null;
};

export function CashflowFormFields({
  idPrefix,
  month,
  monthLabel,
  defaults,
}: Readonly<{
  idPrefix: string;
  month: string;
  monthLabel: string;
  defaults?: CashflowFormDefaults;
}>) {
  return (
    <>
      <input type="hidden" name="month" value={month} />
      <p className="text-sm text-muted-foreground">{monthLabel}</p>
      <div className="space-y-2">
        <Label htmlFor={`saldoAwal-${idPrefix}`}>Starting Balance</Label>
        <NumberInput
          id={`saldoAwal-${idPrefix}`}
          name="saldoAwal"
          defaultValue={defaults?.saldoAwal ?? 0}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`monthlyIncome-${idPrefix}`}>Monthly Income</Label>
        <NumberInput
          id={`monthlyIncome-${idPrefix}`}
          name="monthlyIncome"
          defaultValue={defaults?.monthlyIncome ?? 0}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`saldoAkhirActual-${idPrefix}`}>Ending Balance (Actual)</Label>
        <NumberInput
          id={`saldoAkhirActual-${idPrefix}`}
          name="saldoAkhirActual"
          defaultValue={defaults?.saldoAkhirActual ?? ""}
          placeholder="Leave blank if not known yet"
        />
      </div>
    </>
  );
}
