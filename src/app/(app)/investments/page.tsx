export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { InvestmentFormFields } from "@/components/investments/investment-form-fields";
import { InvestmentTable } from "@/components/investments/investment-table";
import { prisma } from "@/lib/prisma";
import { createInvestment } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function InvestmentsPage() {
  const investments = await prisma.investment.findMany({
    orderBy: { platform: "asc" },
  });

  const totalModal = investments.reduce((sum, i) => sum + Number(i.buyValue), 0);
  const totalNilai = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
  const gainLoss = totalNilai - totalModal;
  const gainLossPct = totalModal > 0 ? (gainLoss / totalModal) * 100 : 0;

  const summaryItems = [
    { label: "Total Modal", value: formatIDR(totalModal) },
    { label: "Total Nilai Sekarang", value: formatIDR(totalNilai), tone: "highlight" as const },
    {
      label: "Gain/Loss",
      value: `${gainLoss >= 0 ? "+" : ""}${formatIDR(gainLoss)}`,
      sublabel: `${gainLossPct >= 0 ? "+" : ""}${gainLossPct.toFixed(1)}%`,
      tone: gainLoss >= 0 ? ("positive" as const) : ("negative" as const),
    },
    { label: "Jumlah Investasi", value: String(investments.length) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Investasi</CardTitle>
          <FormDialog title="Tambah Investasi" triggerLabel="Tambah" action={createInvestment}>
            <InvestmentFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <InvestmentTable rows={investments} />
        </CardContent>
      </Card>
    </div>
  );
}
