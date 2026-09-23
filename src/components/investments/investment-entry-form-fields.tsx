import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/number-input";

type InvestmentOption = { id: string; platform: string; name: string };

export type InvestmentEntryFormDefaults = {
  investmentId?: string;
  month?: string;
  amount?: number;
};

export function InvestmentEntryFormFields({
  idPrefix,
  year,
  investments,
  defaults,
}: Readonly<{
  idPrefix: string;
  year: number;
  investments: InvestmentOption[];
  defaults?: InvestmentEntryFormDefaults;
}>) {
  const months = Array.from({ length: 12 }, (_, m) => new Date(year, m, 1));

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`investmentId-${idPrefix}`}>Platform</Label>
        <select
          id={`investmentId-${idPrefix}`}
          name="investmentId"
          defaultValue={defaults?.investmentId}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          {investments.map((i) => (
            <option key={i.id} value={i.id}>
              {i.platform} · {i.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`month-${idPrefix}`}>Bulan</Label>
        <select
          id={`month-${idPrefix}`}
          name="month"
          defaultValue={defaults?.month}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          {months.map((m) => (
            <option key={m.toISOString()} value={m.toISOString()}>
              {m.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`amount-${idPrefix}`}>Nominal</Label>
        <NumberInput
          id={`amount-${idPrefix}`}
          name="amount"
          defaultValue={defaults?.amount}
          required
        />
      </div>
    </>
  );
}
