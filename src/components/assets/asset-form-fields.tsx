import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
        <Label htmlFor={`name-${idPrefix}`}>Nama</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Motor, Laptop, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`category-${idPrefix}`}>Kategori</Label>
        <Input
          id={`category-${idPrefix}`}
          name="category"
          defaultValue={defaults?.category}
          placeholder="Kendaraan, Elektronik, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`value-${idPrefix}`}>Nilai</Label>
        <Input
          id={`value-${idPrefix}`}
          name="value"
          type="number"
          defaultValue={defaults?.value}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`acquiredDate-${idPrefix}`}>Tanggal Perolehan</Label>
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
