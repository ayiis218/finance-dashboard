"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";
import { formatIDR } from "@/lib/format";

export type CashflowFormDefaults = {
  saldoAwal?: number;
  monthlyIncome?: number;
  saldoAkhirActual?: number | null;
};

export function CashflowFormFields({
  idPrefix,
  month,
  monthLabel,
  totalBudget,
  defaults,
}: Readonly<{
  idPrefix: string;
  month: string;
  monthLabel: string;
  totalBudget: number;
  defaults?: CashflowFormDefaults;
}>) {
  const [saldoAwal, setSaldoAwal] = useState(defaults?.saldoAwal ?? 0);
  const [monthlyIncome, setMonthlyIncome] = useState(defaults?.monthlyIncome ?? 0);
  const expectedEnding = saldoAwal + monthlyIncome - totalBudget;

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
          onValueChange={(v) => setSaldoAwal(v ?? 0)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`monthlyIncome-${idPrefix}`}>Monthly Income</Label>
        <NumberInput
          id={`monthlyIncome-${idPrefix}`}
          name="monthlyIncome"
          defaultValue={defaults?.monthlyIncome ?? 0}
          onValueChange={(v) => setMonthlyIncome(v ?? 0)}
          required
        />
      </div>
      <div className="rounded-md border bg-muted/40 px-3 py-2">
        <p className="text-xs text-muted-foreground">Ending Balance (Expected)</p>
        <p className={"text-lg font-semibold " + (expectedEnding >= 0 ? "text-positive" : "text-destructive")}>
          {formatIDR(expectedEnding)}
        </p>
        <p className="text-xs text-muted-foreground">
          Starting Balance + Monthly Income − Total Budget ({formatIDR(totalBudget)})
        </p>
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
