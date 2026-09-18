import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type GoalItemFormDefaults = {
  category?: string;
  name?: string;
  budgetAmount?: number;
  actualAmount?: number;
  note?: string | null;
};

export function GoalItemFormFields({
  idPrefix,
  goalId,
  defaults,
}: Readonly<{ idPrefix: string; goalId: string; defaults?: GoalItemFormDefaults }>) {
  return (
    <>
      <input type="hidden" name="goalId" value={goalId} />
      <div className="space-y-2">
        <Label htmlFor={`category-${idPrefix}`}>Category</Label>
        <Input
          id={`category-${idPrefix}`}
          name="category"
          defaultValue={defaults?.category}
          placeholder="Mahar, Catering, THR, Individual, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Item Name</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Ring, Photographer, person's name, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`budgetAmount-${idPrefix}`}>Budget</Label>
        <NumberInput
          id={`budgetAmount-${idPrefix}`}
          name="budgetAmount"
          defaultValue={defaults?.budgetAmount}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`actualAmount-${idPrefix}`}>Actual</Label>
        <NumberInput
          id={`actualAmount-${idPrefix}`}
          name="actualAmount"
          defaultValue={defaults?.actualAmount}
          placeholder="Optional, default 0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`note-${idPrefix}`}>Note</Label>
        <Input
          id={`note-${idPrefix}`}
          name="note"
          defaultValue={defaults?.note ?? ""}
          placeholder="Optional"
        />
      </div>
    </>
  );
}
