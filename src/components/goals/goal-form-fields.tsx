import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { NumberInput } from "@/components/number-input";

export type GoalFormDefaults = {
  name?: string;
  targetAmount?: number;
  tenorMonths?: number;
  startDate?: string;
  hasItems?: boolean;
  autoTarget?: boolean;
};

export function GoalFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: GoalFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Goal Name</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Wedding, Eid 2026, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`targetAmount-${idPrefix}`}>Target Amount</Label>
        <NumberInput
          id={`targetAmount-${idPrefix}`}
          name="targetAmount"
          defaultValue={defaults?.targetAmount}
          required
        />
        {defaults?.hasItems && (
          <div className="space-y-1.5 pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox name="autoTarget" defaultChecked={defaults?.autoTarget ?? true} />
              Target otomatis mengikuti total rincian anggaran
            </label>
            <p className="pl-6 text-xs text-muted-foreground">
              Aktif = target di atas otomatis menyesuaikan tiap rincian ditambah/diubah/dihapus.
              Matikan kalau target sengaja dibuat lebih besar sebagai buffer.
            </p>
          </div>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor={`tenorMonths-${idPrefix}`}>Tenor (months)</Label>
        <NumberInput
          id={`tenorMonths-${idPrefix}`}
          name="tenorMonths"
          defaultValue={defaults?.tenorMonths}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`startDate-${idPrefix}`}>Start Saving</Label>
        <Input
          id={`startDate-${idPrefix}`}
          name="startDate"
          type="date"
          defaultValue={defaults?.startDate ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
    </>
  );
}
