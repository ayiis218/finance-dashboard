import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type ReceivableFormDefaults = {
  personName?: string;
  type?: "PIUTANG" | "UTANG";
  amount?: number;
  date?: string;
  note?: string | null;
};

export function ReceivableFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: ReceivableFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`personName-${idPrefix}`}>Person Name</Label>
        <Input
          id={`personName-${idPrefix}`}
          name="personName"
          defaultValue={defaults?.personName}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`type-${idPrefix}`}>Type</Label>
        <select
          id={`type-${idPrefix}`}
          name="type"
          defaultValue={defaults?.type}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          <option value="PIUTANG">Receivable (they owe me)</option>
          <option value="UTANG">Debt (I owe them)</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`amount-${idPrefix}`}>Amount</Label>
        <NumberInput id={`amount-${idPrefix}`} name="amount" defaultValue={defaults?.amount} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`date-${idPrefix}`}>Date</Label>
        <Input
          id={`date-${idPrefix}`}
          name="date"
          type="date"
          defaultValue={defaults?.date ?? new Date().toISOString().slice(0, 10)}
          required
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
