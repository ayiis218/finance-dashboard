"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";
import { formatIDR } from "@/lib/format";

export type CashflowBudgetItemFormDefaults = {
  label?: string;
  amount?: number;
};

export function CashflowBudgetItemFormFields({
  idPrefix,
  month,
  defaults,
  saldoAwal,
  monthlyIncome,
  otherItemsTotal,
}: Readonly<{
  idPrefix: string;
  month?: string;
  defaults?: CashflowBudgetItemFormDefaults;
  /** Provide these three together (per-month context) to show a live "Ending Balance (Expected)" preview. Omit entirely when this form is used for the global allocation template, which has no starting balance of its own. */
  saldoAwal?: number;
  monthlyIncome?: number;
  otherItemsTotal?: number;
}>) {
  const [amount, setAmount] = useState(defaults?.amount ?? 0);
  const showPreview = saldoAwal !== undefined && monthlyIncome !== undefined && otherItemsTotal !== undefined;
  const expectedEnding = showPreview ? saldoAwal + monthlyIncome - (otherItemsTotal + amount) : 0;

  return (
    <>
      {month && <input type="hidden" name="month" value={month} />}
      <div className="space-y-2">
        <Label htmlFor={`label-${idPrefix}`}>Budget Item</Label>
        <Input
          id={`label-${idPrefix}`}
          name="label"
          defaultValue={defaults?.label}
          placeholder="Lifestyle, Investments, Food, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`amount-${idPrefix}`}>Amount</Label>
        <NumberInput
          id={`amount-${idPrefix}`}
          name="amount"
          defaultValue={defaults?.amount}
          onValueChange={(v) => setAmount(v ?? 0)}
          required
        />
      </div>
      {showPreview && (
        <div className="rounded-md border bg-muted/40 px-3 py-2">
          <p className="text-xs text-muted-foreground">Ending Balance (Expected)</p>
          <p className={"text-lg font-semibold " + (expectedEnding >= 0 ? "text-positive" : "text-destructive")}>
            {formatIDR(expectedEnding)}
          </p>
        </div>
      )}
    </>
  );
}
