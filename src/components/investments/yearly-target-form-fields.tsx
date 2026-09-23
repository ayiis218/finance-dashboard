import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";

export function YearlyTargetFormFields({
  idPrefix,
  year,
  defaultAmount,
}: Readonly<{ idPrefix: string; year: number; defaultAmount?: number }>) {
  return (
    <>
      <input type="hidden" name="year" value={year} />
      <div className="space-y-2">
        <Label htmlFor={`targetAmount-${idPrefix}`}>Annual Target {year}</Label>
        <NumberInput
          id={`targetAmount-${idPrefix}`}
          name="targetAmount"
          defaultValue={defaultAmount}
          required
        />
      </div>
    </>
  );
}
