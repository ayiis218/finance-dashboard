import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";

export type BudgetEntryFormDefaults = {
  expectation?: number;
  actual?: number;
  minTarget?: number | null;
  maxTarget?: number | null;
};

export function BudgetEntryFormFields({
  idPrefix,
  defaults,
  hiddenCategoryId,
  hiddenMonth,
}: Readonly<{
  idPrefix: string;
  defaults?: BudgetEntryFormDefaults;
  hiddenCategoryId?: string;
  hiddenMonth?: string;
}>) {
  return (
    <>
      {hiddenCategoryId && <input type="hidden" name="categoryId" value={hiddenCategoryId} />}
      {hiddenMonth && <input type="hidden" name="month" value={hiddenMonth} />}
      <div className="space-y-2">
        <Label htmlFor={`expectation-${idPrefix}`}>Expected</Label>
        <NumberInput
          id={`expectation-${idPrefix}`}
          name="expectation"
          defaultValue={defaults?.expectation}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`actual-${idPrefix}`}>Actual</Label>
        <NumberInput
          id={`actual-${idPrefix}`}
          name="actual"
          defaultValue={defaults?.actual}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`minTarget-${idPrefix}`}>Minimum Target</Label>
        <NumberInput
          id={`minTarget-${idPrefix}`}
          name="minTarget"
          defaultValue={defaults?.minTarget ?? ""}
          placeholder="Optional"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`maxTarget-${idPrefix}`}>Maximum Target</Label>
        <NumberInput
          id={`maxTarget-${idPrefix}`}
          name="maxTarget"
          defaultValue={defaults?.maxTarget ?? ""}
          placeholder="Optional"
        />
      </div>
    </>
  );
}
