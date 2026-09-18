export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { ReceivableFormFields } from "@/components/receivables/receivable-form-fields";
import { ReceivableTable } from "@/components/receivables/receivable-table";
import { getReceivablesWithStatus } from "@/lib/queries";
import { createReceivable } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function ReceivablesPage() {
  const receivables = await getReceivablesWithStatus();

  const outstanding = receivables.filter((r) => r.status !== "SETTLED");
  const totalReceivables = outstanding
    .filter((r) => r.type === "PIUTANG")
    .reduce((sum, r) => sum + r.remaining, 0);
  const totalDebt = outstanding
    .filter((r) => r.type === "UTANG")
    .reduce((sum, r) => sum + r.remaining, 0);
  const totalRepaid = outstanding.reduce((sum, r) => sum + r.totalPaid, 0);

  const summaryItems = [
    { label: "Outstanding Receivables", value: formatIDR(totalReceivables), tone: "positive" as const },
    { label: "Outstanding Debt", value: formatIDR(totalDebt), tone: "negative" as const },
    { label: "Total Repaid", value: formatIDR(totalRepaid) },
    {
      label: "Net Position",
      value: formatIDR(totalReceivables - totalDebt),
      tone: "highlight" as const,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Receivables &amp; Debts</CardTitle>
          <FormDialog title="Add Receivable/Debt" triggerLabel="Add" action={createReceivable}>
            <ReceivableFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <ReceivableTable rows={receivables} />
        </CardContent>
      </Card>
    </div>
  );
}
