import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type CashflowBudgetItemFormDefaults = {
  label?: string;
  amount?: number;
};

export function CashflowBudgetItemFormFields({
  idPrefix,
  month,
  defaults,
}: Readonly<{
  idPrefix: string;
  month?: string;
  defaults?: CashflowBudgetItemFormDefaults;
}>) {
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
          required
        />
      </div>
    </>
  );
}
