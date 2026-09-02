export const dynamic = "force-dynamic";

import Link from "next/link";
import { addMonths, format, parse, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { MonthlyExpenseChartLazy } from "@/components/charts/monthly-expense-chart-lazy";
import { BreakdownPieChartLazy } from "@/components/charts/breakdown-pie-chart-lazy";
import { SummaryStats, type SummaryStatItem } from "@/components/summary-stats";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import {
  getExpenseByCategory,
  getInvestmentAllocation,
  getMonthlyExpenseComparison,
  getSpendingByCategoryDetailed,
} from "@/lib/queries";
import { formatIDR } from "@/lib/format";

export default async function ReportsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ month?: string }> }>) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ? parse(monthParam, "yyyy-MM", new Date()) : new Date();

  const [monthlyExpense, expenseByCategory, investmentAllocation, spendingDetailed] =
    await Promise.all([
      getMonthlyExpenseComparison(12),
      getExpenseByCategory(month),
      getInvestmentAllocation(),
      getSpendingByCategoryDetailed(month),
    ]);

  const prevMonth = format(subMonths(month, 1), "yyyy-MM");
  const nextMonth = format(addMonths(month, 1), "yyyy-MM");

  const totalExpense12Months = monthlyExpense.reduce((sum, m) => sum + m.total, 0);
  const avgExpensePerMonth = monthlyExpense.length > 0 ? totalExpense12Months / monthlyExpense.length : 0;

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
      label: "Total Pengeluaran 12 Bulan",
      description: "Jumlah semua pengeluaran dalam setahun terakhir",
      value: formatIDR(totalExpense12Months),
      tone: "negative",
    },
    {
      label: "Rata-rata Pengeluaran/Bulan",
      description: "Total pengeluaran dibagi jumlah bulan",
      value: formatIDR(avgExpensePerMonth),
    },
    {
      label: "Kategori Pengeluaran Terbesar",
      description: `${format(month, "MMMM yyyy")} — kategori yang paling banyak menyerap uangmu`,
      value: topCategory ? formatIDR(topCategory.total) : "-",
      sublabel: topCategory?.category,
    },
    {
      label: "Platform Investasi Terbesar",
      description: "Platform dengan nilai investasi paling besar saat ini",
      value: topPlatform ? formatIDR(topPlatform.total) : "-",
      sublabel: topPlatform?.platform,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />

      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Perbandingan Pengeluaran Bulanan</CardTitle>
          <CardDescription>
            12 bulan terakhir — batang lebih tinggi berarti pengeluaran lebih besar di bulan itu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyExpenseChartLazy data={monthlyExpense} />
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={<Link href={`?month=${prevMonth}`} />}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <span className="min-w-36 text-center text-sm font-medium">
          {format(month, "MMMM yyyy")}
        </span>
        <Button
          variant="outline"
          size="icon"
          nativeButton={false}
          render={<Link href={`?month=${nextMonth}`} />}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>
              {format(month, "MMMM yyyy")} — potongan lebih besar berarti kategori itu
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
            <CardTitle>Alokasi Investasi</CardTitle>
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
          <CardTitle>Rincian Pengeluaran per Kategori</CardTitle>
          <CardDescription>
            {format(month, "MMMM yyyy")} — mencakup Pengeluaran & Transfer ke luar sistem
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
                  <TableHead>Kategori</TableHead>
                  <TableHead className="text-center">Jumlah Transaksi</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% dari Total</TableHead>
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
                      Belum ada pengeluaran di bulan ini.
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
                <MobileRowField label="Jumlah Transaksi" value={c.count} />
                <MobileRowField label="% dari Total" value={`${c.percentage.toFixed(1)}%`} />
                <p className="text-lg font-semibold">{formatIDR(c.total)}</p>
              </MobileRowCard>
            ))}
            {spendingDetailed.length === 0 && (
              <MobileEmptyState>Belum ada pengeluaran di bulan ini.</MobileEmptyState>
            )}
            {spendingDetailed.length > 0 && (
              <MobileRowCard className="bg-muted/50 font-medium">
                <MobileRowHeader title="Total" />
                <MobileRowField label="Jumlah Transaksi" value={spendingCount} />
                <MobileRowField label="% dari Total" value="100%" />
                <p className="text-lg font-semibold">{formatIDR(spendingTotal)}</p>
              </MobileRowCard>
            )}
          </MobileCardList>
        </CardContent>
      </Card>
    </div>
  );
}
