import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type BudgetCategoryFormDefaults = {
  name?: string;
  monthlyPlanned?: number;
};

export function BudgetCategoryFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: BudgetCategoryFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Category Name</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Food, Transport, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`monthlyPlanned-${idPrefix}`}>Monthly Budget</Label>
        <NumberInput
          id={`monthlyPlanned-${idPrefix}`}
          name="monthlyPlanned"
          defaultValue={defaults?.monthlyPlanned}
          required
        />
      </div>
    </>
  );
}
