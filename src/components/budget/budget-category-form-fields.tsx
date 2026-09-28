import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type BudgetCategoryFormDefaults = {
  name?: string;
  monthlyPlanned?: number;
};

export function BudgetCategoryFormFields({
  idPrefix,
  categories,
  defaults,
}: Readonly<{ idPrefix: string; categories: string[]; defaults?: BudgetCategoryFormDefaults }>) {
  const datalistId = `budget-category-suggestions-${idPrefix}`;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Category Name</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          list={datalistId}
          defaultValue={defaults?.name}
          placeholder="Food, Transport, etc."
          required
        />
        <datalist id={datalistId}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
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
