export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MonthlyExpenseChartLazy } from "@/components/charts/monthly-expense-chart-lazy";
import { BreakdownPieChartLazy } from "@/components/charts/breakdown-pie-chart-lazy";
import {
  getExpenseByCategory,
  getInvestmentAllocation,
  getMonthlyExpenseComparison,
} from "@/lib/queries";

export default async function ReportsPage() {
  const [monthlyExpense, expenseByCategory, investmentAllocation] =
    await Promise.all([
      getMonthlyExpenseComparison(12),
      getExpenseByCategory(),
      getInvestmentAllocation(),
    ]);

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Perbandingan Pengeluaran Bulanan</CardTitle>
          <CardDescription>12 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyExpenseChartLazy data={monthlyExpense} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
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
            <CardDescription>Berdasarkan platform</CardDescription>
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
    </div>
  );
}
