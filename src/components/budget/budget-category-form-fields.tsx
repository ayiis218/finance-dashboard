import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
        <Label htmlFor={`name-${idPrefix}`}>Nama Kategori</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Makan, Transport, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`monthlyPlanned-${idPrefix}`}>Anggaran Bulanan</Label>
        <Input
          id={`monthlyPlanned-${idPrefix}`}
          name="monthlyPlanned"
          type="number"
          defaultValue={defaults?.monthlyPlanned}
          required
        />
      </div>
    </>
  );
}
