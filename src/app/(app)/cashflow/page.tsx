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

  const overview = await getCashflowYearOverview(year);
  const { rows } = overview;

  const totalExpectedDelta = rows.reduce((sum, r) => sum + r.expectedDelta, 0);
  const totalVariance = rows.reduce((sum, r) => sum + r.variance, 0);

  const summaryItems = [
    { label: "Saldo Awal Tahun", value: formatIDR(rows[0].saldoAwal) },
    {
      label: "Saldo Akhir Tahun (Live)",
      value: formatIDR(rows[11].saldoAkhirWalletLive),
      tone: "highlight" as const,
    },
    {
      label: "Total Rencana Tahun",
      value: `${totalExpectedDelta > 0 ? "+" : ""}${formatIDR(totalExpectedDelta)}`,
      tone: totalExpectedDelta >= 0 ? ("positive" as const) : ("negative" as const),
    },
    {
      label: "Total Selisih Tahun",
      value: `${totalVariance > 0 ? "+" : ""}${formatIDR(totalVariance)}`,
      tone: totalVariance >= 0 ? ("positive" as const) : ("negative" as const),
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
