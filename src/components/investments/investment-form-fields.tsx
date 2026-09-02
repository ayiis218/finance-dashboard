import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export type InvestmentFormDefaults = {
  platform?: string;
  name?: string;
  buyValue?: number;
  currentValue?: number;
};

export function InvestmentFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: InvestmentFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`platform-${idPrefix}`}>Platform</Label>
        <Input
          id={`platform-${idPrefix}`}
          name="platform"
          defaultValue={defaults?.platform}
          placeholder="Bibit, Ajaib, Indodax, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Nama Instrumen</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="Reksadana X, Saham Y, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`buyValue-${idPrefix}`}>Nilai Beli</Label>
        <Input
          id={`buyValue-${idPrefix}`}
          name="buyValue"
          type="number"
          defaultValue={defaults?.buyValue}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`currentValue-${idPrefix}`}>Nilai Sekarang</Label>
        <Input
          id={`currentValue-${idPrefix}`}
          name="currentValue"
          type="number"
          defaultValue={defaults?.currentValue}
          required
        />
      </div>
    </>
  );
}
