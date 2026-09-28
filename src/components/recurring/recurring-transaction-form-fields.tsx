import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { NumberInput } from "@/components/number-input";

type Account = { id: string; name: string };

export type RecurringTransactionFormDefaults = {
  accountId?: string;
  toAccountId?: string | null;
  type?: "INCOME" | "EXPENSE" | "TRANSFER";
  category?: string;
  amount?: number;
  note?: string | null;
  affectsBalance?: boolean;
  frequency?: "DAILY" | "WEEKLY" | "MONTHLY";
  startDate?: string;
  endDate?: string | null;
};

export function RecurringTransactionFormFields({
  idPrefix,
  accounts,
  categories,
  defaults,
}: Readonly<{
  idPrefix: string;
  accounts: Account[];
  categories: string[];
  defaults?: RecurringTransactionFormDefaults;
}>) {
  const datalistId = `recurring-category-suggestions-${idPrefix}`;

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={`accountId-${idPrefix}`}>Account</Label>
        <select
          id={`accountId-${idPrefix}`}
          name="accountId"
          defaultValue={defaults?.accountId}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
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
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
          <option value="TRANSFER">Transfer</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`toAccountId-${idPrefix}`}>Destination Account (Transfer only)</Label>
        <select
          id={`toAccountId-${idPrefix}`}
          name="toAccountId"
          defaultValue={defaults?.toAccountId ?? ""}
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          <option value="">— None (external transfer) —</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`category-${idPrefix}`}>Category</Label>
        <Input
          id={`category-${idPrefix}`}
          name="category"
          list={datalistId}
          defaultValue={defaults?.category}
          placeholder="Gaji, Sewa, Langganan, dll"
          required
        />
        <datalist id={datalistId}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`amount-${idPrefix}`}>Amount</Label>
        <NumberInput id={`amount-${idPrefix}`} name="amount" defaultValue={defaults?.amount} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`frequency-${idPrefix}`}>Frequency</Label>
        <select
          id={`frequency-${idPrefix}`}
          name="frequency"
          defaultValue={defaults?.frequency ?? "MONTHLY"}
          required
          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        >
          <option value="DAILY">Daily</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`startDate-${idPrefix}`}>Start Date</Label>
        <Input
          id={`startDate-${idPrefix}`}
          name="startDate"
          type="date"
          defaultValue={defaults?.startDate ?? new Date().toISOString().slice(0, 10)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`endDate-${idPrefix}`}>End Date</Label>
        <Input
          id={`endDate-${idPrefix}`}
          name="endDate"
          type="date"
          defaultValue={defaults?.endDate ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Kosongkan kalau rule ini berjalan terus tanpa batas.
        </p>
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
      <div className="space-y-1.5">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox name="affectsBalance" defaultChecked={defaults?.affectsBalance ?? true} />
          This transaction affects account balance
        </label>
      </div>
    </>
  );
}
