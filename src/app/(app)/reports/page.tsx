export const dynamic = "force-dynamic";

import { format, parse, startOfMonth, subMonths } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyExpenseChartLazy } from "@/components/charts/monthly-expense-chart-lazy";
import { BreakdownPieChartLazy } from "@/components/charts/breakdown-pie-chart-lazy";
import { SummaryStats, type SummaryStatItem } from "@/components/summary-stats";
import { DateRangeFilter } from "@/components/date-range-filter";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import {
  getExpenseByCategory,
  getMonthlyExpenseComparison,
  getSpendingByCategoryDetailed,
} from "@/lib/queries/transactions";
import { getInvestmentAllocation } from "@/lib/queries/investments";
import { formatIDR } from "@/lib/format";

export default async function ReportsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ from?: string; to?: string }> }>) {
  const { from: fromParam, to: toParam } = await searchParams;
  let from = fromParam
    ? parse(fromParam, "yyyy-MM-dd", new Date())
    : startOfMonth(subMonths(new Date(), 5));
  let to = toParam ? parse(toParam, "yyyy-MM-dd", new Date()) : new Date();
  if (from > to) [from, to] = [to, from];

  const rangeLabel = `${format(from, "d MMM yyyy")} – ${format(to, "d MMM yyyy")}`;

  const [monthlyExpense, expenseByCategory, investmentAllocation, spendingDetailed] =
    await Promise.all([
      getMonthlyExpenseComparison({ from, to }),
      getExpenseByCategory({ from, to }),
      getInvestmentAllocation(),
      getSpendingByCategoryDetailed({ from, to }),
    ]);

  const totalExpenseRange = monthlyExpense.reduce((sum, m) => sum + m.total, 0);
  const avgExpensePerMonth = monthlyExpense.length > 0 ? totalExpenseRange / monthlyExpense.length : 0;

  const topCategory = expenseByCategory.reduce<{ category: string; total: number } | null>(
    (top, c) => (!top || c.total > top.total ? c : top),
    null,
  );
  const topPlatform = investmentAllocation.reduce<{ platform: string; total: number } | null>(
    (top, i) => (!top || i.total > top.total ? i : top),
    null,
  );

  const spendingTotal = spendingDetailed.reduce((sum, c) => sum + c.total, 0);
  const spendingCount = spendingDetailed.reduce((sum, c) => sum + c.count, 0);

  const summaryItems: SummaryStatItem[] = [
    {
      label: "Total Expense",
      description: `Jumlah semua pengeluaran periode ${rangeLabel}`,
      value: formatIDR(totalExpenseRange),
      tone: "negative",
    },
    {
      label: "Average Expense/Month",
      description: "Total pengeluaran dibagi jumlah bulan pada periode terpilih",
      value: formatIDR(avgExpensePerMonth),
    },
    {
      label: "Top Expense Category",
      description: `${rangeLabel} — kategori yang paling banyak menyerap uangmu`,
      value: topCategory ? formatIDR(topCategory.total) : "-",
      sublabel: topCategory?.category,
    },
    {
      label: "Top Investment Platform",
      description: "Platform dengan nilai investasi paling besar saat ini",
      value: topPlatform ? formatIDR(topPlatform.total) : "-",
      sublabel: topPlatform?.platform,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />

      <DateRangeFilter from={from} to={to} baseHref="/reports" />

      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Monthly Expense Comparison</CardTitle>
          <CardDescription>
            {rangeLabel} — batang lebih tinggi berarti pengeluaran lebih besar di bulan itu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyExpenseChartLazy data={monthlyExpense} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Expense by Category</CardTitle>
            <CardDescription>
              {rangeLabel} — potongan lebih besar berarti kategori itu
              menghabiskan porsi pengeluaran paling banyak
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownPieChartLazy
              data={expenseByCategory.map((c) => ({
                name: c.category,
                value: c.total,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Investment Allocation</CardTitle>
            <CardDescription>
              Berdasarkan platform — menunjukkan bagaimana investasimu tersebar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownPieChartLazy
              data={investmentAllocation.map((i) => ({
                name: i.platform,
                value: i.total,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Expense Breakdown by Category</CardTitle>
          <CardDescription>
            {rangeLabel} — mencakup Pengeluaran & Transfer ke luar sistem
            (transfer antar rekening sendiri tidak dihitung sebagai pengeluaran), diurutkan dari
            yang paling besar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-center">Transactions</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {spendingDetailed.map((c, index) => (
                  <TableRow key={c.category}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell className="text-center">{c.count}</TableCell>
                    <TableCell className="text-right">{formatIDR(c.total)}</TableCell>
                    <TableCell className="text-right">{c.percentage.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
                {spendingDetailed.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No expenses in this period.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              {spendingDetailed.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell />
                    <TableCell className="font-medium">Total</TableCell>
                    <TableCell className="text-center font-medium">{spendingCount}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatIDR(spendingTotal)}
                    </TableCell>
                    <TableCell className="text-right font-medium">100%</TableCell>
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          <MobileCardList>
            {spendingDetailed.map((c) => (
              <MobileRowCard key={c.category}>
                <MobileRowHeader title={c.category} />
                <MobileRowField label="Transactions" value={c.count} />
                <MobileRowField label="% of Total" value={`${c.percentage.toFixed(1)}%`} />
                <p className="text-lg font-semibold">{formatIDR(c.total)}</p>
              </MobileRowCard>
            ))}
            {spendingDetailed.length === 0 && (
              <MobileEmptyState>No expenses in this period.</MobileEmptyState>
            )}
            {spendingDetailed.length > 0 && (
              <MobileRowCard className="bg-muted/50 font-medium">
                <MobileRowHeader title="Total" />
                <MobileRowField label="Transactions" value={spendingCount} />
                <MobileRowField label="% of Total" value="100%" />
                <p className="text-lg font-semibold">{formatIDR(spendingTotal)}</p>
              </MobileRowCard>
            )}
          </MobileCardList>
        </CardContent>
      </Card>
    </div>
  );
}
