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

  const outstanding = receivables.filter((r) => r.status !== "LUNAS");
  const totalPiutang = outstanding
    .filter((r) => r.type === "PIUTANG")
    .reduce((sum, r) => sum + r.remaining, 0);
  const totalUtang = outstanding
    .filter((r) => r.type === "UTANG")
    .reduce((sum, r) => sum + r.remaining, 0);
  const totalDicicil = outstanding.reduce((sum, r) => sum + r.totalPaid, 0);

  const summaryItems = [
    { label: "Total Piutang Outstanding", value: formatIDR(totalPiutang), tone: "positive" as const },
    { label: "Total Utang Outstanding", value: formatIDR(totalUtang), tone: "negative" as const },
    { label: "Total Sudah Dicicil", value: formatIDR(totalDicicil) },
    {
      label: "Posisi Bersih",
      value: formatIDR(totalPiutang - totalUtang),
      tone: "highlight" as const,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Piutang &amp; Utang</CardTitle>
          <FormDialog title="Tambah Piutang/Utang" triggerLabel="Tambah" action={createReceivable}>
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
