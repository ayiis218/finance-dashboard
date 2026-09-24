import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";

export function AllocationTemplateFormFields({
  idPrefix,
  defaultMonthlyIncome,
}: Readonly<{ idPrefix: string; defaultMonthlyIncome?: number }>) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`monthlyIncome-${idPrefix}`}>Monthly Income</Label>
      <NumberInput
        id={`monthlyIncome-${idPrefix}`}
        name="monthlyIncome"
        defaultValue={defaultMonthlyIncome ?? 0}
        required
      />
    </div>
  );
}
