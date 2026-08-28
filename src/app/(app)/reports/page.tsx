export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MonthlyExpenseChart } from "@/components/charts/monthly-expense-chart";
import { BreakdownPieChart } from "@/components/charts/breakdown-pie-chart";
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Pengeluaran Bulanan</CardTitle>
          <CardDescription>12 bulan terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <MonthlyExpenseChart data={monthlyExpense} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pengeluaran per Kategori</CardTitle>
            <CardDescription>Bulan ini</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownPieChart
              data={expenseByCategory.map((c) => ({
                name: c.category,
                value: c.total,
              }))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alokasi Investasi</CardTitle>
            <CardDescription>Berdasarkan platform</CardDescription>
          </CardHeader>
          <CardContent>
            <BreakdownPieChart
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
