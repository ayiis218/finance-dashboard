export const dynamic = "force-dynamic";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { YearNav } from "@/components/year-nav";
import { BreakdownPieCard } from "@/components/breakdown-pie-card";
import { InvestmentFormFields } from "@/components/investments/investment-form-fields";
import { InvestmentTable } from "@/components/investments/investment-table";
import { YearlyTargetFormFields } from "@/components/investments/yearly-target-form-fields";
import { YearlyTargetSummary } from "@/components/investments/yearly-target-summary";
import { InvestmentEntryFormFields } from "@/components/investments/investment-entry-form-fields";
import { InvestmentEntryTable } from "@/components/investments/investment-entry-table";
import { getInvestments } from "@/lib/queries/investments";
import { getInvestmentYearOverview } from "@/lib/queries/investment-targets";
import { createInvestment } from "@/lib/actions/investments";
import { setInvestmentYearlyTarget } from "@/lib/actions/investment-targets";
import { createInvestmentEntry } from "@/lib/actions/investment-entries";
import { formatIDR } from "@/lib/format";

export default async function InvestmentsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ year?: string }> }>) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  const [investments, yearOverview] = await Promise.all([
    getInvestments(),
    getInvestmentYearOverview(year),
  ]);

  // Derived in-memory from the `investments` array already fetched above —
  // no need for a second full-table scan just to group the same rows by platform.
  const allocationByPlatform = new Map<string, number>();
  for (const investment of investments) {
    allocationByPlatform.set(
      investment.platform,
      (allocationByPlatform.get(investment.platform) ?? 0) + Number(investment.currentValue),
    );
  }
  const investmentAllocation = Array.from(allocationByPlatform.entries()).map(
    ([platform, total]) => ({ platform, total }),
  );

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

      <BreakdownPieCard
        title="Investment Allocation"
        description="Berdasarkan platform — menunjukkan bagaimana investasimu tersebar"
        data={investmentAllocation.map((i) => ({ name: i.platform, value: i.total }))}
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Annual Investment Target</CardTitle>
            <CardDescription>{year}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <FormDialog
              title={`Set Target — ${year}`}
              triggerLabel={yearOverview.target ? "Edit Target" : "Set Target"}
              triggerVariant="outline"
              action={setInvestmentYearlyTarget}
            >
              <YearlyTargetFormFields
                idPrefix="target"
                year={year}
                defaultAmount={yearOverview.targetAmount || undefined}
              />
            </FormDialog>
            {investments.length > 0 ? (
              <FormDialog title="Add Investment Entry" triggerLabel="Add Entry" action={createInvestmentEntry}>
                <InvestmentEntryFormFields idPrefix="new" year={year} investments={investments} />
              </FormDialog>
            ) : (
              <p className="text-xs text-muted-foreground">Add an investment above first</p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <YearNav year={year} baseHref="/investments" />
          <YearlyTargetSummary
            targetAmount={yearOverview.targetAmount}
            totalInvested={yearOverview.totalInvested}
            remaining={yearOverview.remaining}
            progressPct={yearOverview.progressPct}
            monthsWithEntry={yearOverview.monthsWithEntry}
          />
          <div className="mt-4">
            <InvestmentEntryTable rows={yearOverview.rows} year={year} investments={investments} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
