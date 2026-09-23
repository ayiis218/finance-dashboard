export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SummaryStats } from "@/components/summary-stats";
import { YearNav } from "@/components/year-nav";
import { CashflowTable } from "@/components/cashflow/cashflow-table";
import { getCashflowYearOverview } from "@/lib/queries/cashflow";
import { formatIDR } from "@/lib/format";

export default async function CashflowPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ year?: string }> }>) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  const { rows } = await getCashflowYearOverview(year);
  const december = rows[11];
  const totalVariance = rows.reduce((sum, r) => sum + (r.variance ?? 0), 0);
  const hasAnyActual = rows.some((r) => r.saldoAkhirActual != null);

  const summaryItems = [
    { label: "Starting Balance (Year)", value: formatIDR(rows[0].saldoAwal) },
    {
      label: "Ending Balance Expected (Dec)",
      value: formatIDR(december.saldoAkhirExpected),
      tone: "highlight" as const,
    },
    {
      label: "Ending Balance Actual (Dec)",
      value: december.saldoAkhirActual != null ? formatIDR(december.saldoAkhirActual) : "-",
    },
    {
      label: "Total Variance (Year)",
      value: hasAnyActual
        ? `${totalVariance > 0 ? "+" : ""}${formatIDR(totalVariance)}`
        : "-",
      tone: hasAnyActual ? (totalVariance >= 0 ? ("positive" as const) : ("negative" as const)) : undefined,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Cashflow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <YearNav year={year} baseHref="/cashflow" />
          <CashflowTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
