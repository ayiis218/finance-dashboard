export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { InvestmentFormFields } from "@/components/investments/investment-form-fields";
import { InvestmentTable } from "@/components/investments/investment-table";
import { getInvestments } from "@/lib/queries/investments";
import { createInvestment } from "@/lib/actions/investments";
import { formatIDR } from "@/lib/format";

export default async function InvestmentsPage() {
  const investments = await getInvestments();

  const totalBuyValue = investments.reduce(
    (sum, investment) => sum + Number(investment.buyValue),
    0,
  );
  const totalCurrentValue = investments.reduce(
    (sum, investment) => sum + Number(investment.currentValue),
    0,
  );
  const gainLoss = totalCurrentValue - totalBuyValue;
  const gainLossPct = totalBuyValue > 0 ? (gainLoss / totalBuyValue) * 100 : 0;

  const summaryItems = [
    { label: "Total Invested", value: formatIDR(totalBuyValue) },
    { label: "Total Current Value", value: formatIDR(totalCurrentValue), tone: "highlight" as const },
    {
      label: "Gain/Loss",
      value: `${gainLoss >= 0 ? "+" : ""}${formatIDR(gainLoss)}`,
      sublabel: `${gainLossPct >= 0 ? "+" : ""}${gainLossPct.toFixed(1)}%`,
      tone: gainLoss >= 0 ? ("positive" as const) : ("negative" as const),
    },
    { label: "Number of Investments", value: String(investments.length) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Investments</CardTitle>
          <FormDialog title="Add Investment" triggerLabel="Add" action={createInvestment}>
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
