import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
        <Label htmlFor={`expectation-${idPrefix}`}>Ekspektasi</Label>
        <Input
          id={`expectation-${idPrefix}`}
          name="expectation"
          type="number"
          defaultValue={defaults?.expectation}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`actual-${idPrefix}`}>Aktual</Label>
        <Input
          id={`actual-${idPrefix}`}
          name="actual"
          type="number"
          defaultValue={defaults?.actual}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`minTarget-${idPrefix}`}>Target Minimum</Label>
        <Input
          id={`minTarget-${idPrefix}`}
          name="minTarget"
          type="number"
          defaultValue={defaults?.minTarget ?? ""}
          placeholder="Opsional"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`maxTarget-${idPrefix}`}>Target Maksimum</Label>
        <Input
          id={`maxTarget-${idPrefix}`}
          name="maxTarget"
          type="number"
          defaultValue={defaults?.maxTarget ?? ""}
          placeholder="Opsional"
        />
      </div>
    </>
  );
}
