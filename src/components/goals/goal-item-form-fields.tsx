import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
        <Label htmlFor={`category-${idPrefix}`}>Kategori</Label>
        <Input
          id={`category-${idPrefix}`}
          name="category"
          defaultValue={defaults?.category}
          placeholder="Mahar, Catering, THR, Individu, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Nama Rincian</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Cincin, Fotografer, nama orang, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`budgetAmount-${idPrefix}`}>Anggaran</Label>
        <Input
          id={`budgetAmount-${idPrefix}`}
          name="budgetAmount"
          type="number"
          defaultValue={defaults?.budgetAmount}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`actualAmount-${idPrefix}`}>Aktual</Label>
        <Input
          id={`actualAmount-${idPrefix}`}
          name="actualAmount"
          type="number"
          defaultValue={defaults?.actualAmount}
          placeholder="Opsional, default 0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`note-${idPrefix}`}>Catatan</Label>
        <Input
          id={`note-${idPrefix}`}
          name="note"
          defaultValue={defaults?.note ?? ""}
          placeholder="Opsional"
        />
      </div>
    </>
  );
}
