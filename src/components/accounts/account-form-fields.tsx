import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export type AccountFormDefaults = {
  name?: string;
  balance?: number;
};

export function AccountFormFields({
  idPrefix,
  defaults,
}: Readonly<{ idPrefix: string; defaults?: AccountFormDefaults }>) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`name-${idPrefix}`}>Nama</Label>
        <Input
          id={`name-${idPrefix}`}
          name="name"
          defaultValue={defaults?.name}
          placeholder="BCA, Cash, dll"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`balance-${idPrefix}`}>Saldo</Label>
        <NumberInput
          id={`balance-${idPrefix}`}
          name="balance"
          defaultValue={defaults?.balance ?? 0}
          required
        />
      </div>
    </>
  );
}
