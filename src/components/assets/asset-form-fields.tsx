import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type AssetFormDefaults = {
  name?: string;
  category?: string;
  value?: number;
  acquiredDate?: string;
};

export function AssetFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: AssetFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Name</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Motorcycle, Laptop, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`category-${idPrefix}`}>Category</Label>
        <Input
          id={`category-${idPrefix}`}
          name="category"
          defaultValue={defaults?.category}
          placeholder="Vehicle, Electronics, etc."
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`value-${idPrefix}`}>Value</Label>
        <NumberInput id={`value-${idPrefix}`} name="value" defaultValue={defaults?.value} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`acquiredDate-${idPrefix}`}>Acquired Date</Label>
        <Input
          id={`acquiredDate-${idPrefix}`}
          name="acquiredDate"
          type="date"
          defaultValue={defaults?.acquiredDate}
          required
        />
      </div>
    </>
  );
}
