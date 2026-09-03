export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyExpenseChartLazy } from "@/components/charts/monthly-expense-chart-lazy";
import { SummaryStats, type SummaryStatItem } from "@/components/summary-stats";
import {
  getBudgetOverview,
  getDailySummary,
  getMonthlyExpenseComparison,
  getSummary,
} from "@/lib/queries";
import { formatIDR } from "@/lib/format";

export default async function DashboardPage() {
  const [summary, daily, monthlyExpense, budgetOverview] = await Promise.all([
    getSummary(),
    getDailySummary(),
    getMonthlyExpenseComparison(),
    getBudgetOverview(new Date()),
  ]);

  const remainingBudget = budgetOverview.totals.planned - budgetOverview.totals.actual;

  const summaryItems: SummaryStatItem[] = [
    {
      label: "Total Saldo",
      description: "Uang tunai di semua rekening bank & cash",
      value: formatIDR(summary.totalBalance),
    },
    {
      label: "Total Aset",
      description: "Nilai properti, kendaraan & barang berharga lain",
      value: formatIDR(summary.totalAssets),
    },
    {
      label: "Total Investasi",
      description: "Nilai investasi saat ini (reksadana, saham, dll)",
      value: formatIDR(summary.totalInvestments),
    },
    {
      label: "Total Utang",
      description: "Sisa utang yang masih harus dibayar (sudah dikurangi cicilan)",
      value: formatIDR(summary.totalDebt),
      tone: summary.totalDebt > 0 ? "negative" : "default",
    },
    {
      label: "Sisa Anggaran Bulan Ini",
      description: "Anggaran bulanan dikurangi pengeluaran yang sudah terjadi",
      value: formatIDR(remainingBudget),
      tone: remainingBudget >= 0 ? "positive" : "negative",
    },
    {
      label: "Kekayaan Bersih",
      description: "Saldo + aset + investasi + piutang, dikurangi utang",
      value: formatIDR(summary.netWorth),
      tone: "highlight",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Perbandingan Pengeluaran Bulanan</CardTitle>
            <CardDescription>
              6 bulan terakhir — batang lebih tinggi berarti pengeluaran lebih besar di bulan itu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyExpenseChartLazy data={monthlyExpense} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Ringkasan Hari Ini</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pemasukan</span>
              <Badge variant="secondary" className="text-positive">
                {formatIDR(daily.income)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Pengeluaran
              </span>
              <Badge variant="secondary" className="text-destructive">
                {formatIDR(daily.expense)}
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              {daily.transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Belum ada transaksi hari ini.
                </p>
              )}
              {daily.transactions.map((items) => {
                const category = items?.note
                  ? `${items.category} - ${items.note}`
                  : items.category;
                return (
                  <div
                    key={items.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{category}</span>
                    <span
                      className={
                        items.type === "INCOME" ? "text-positive" : "text-destructive"
                      }
                    >
                      {items.type === "INCOME" ? "+" : "-"}
                      {formatIDR(Number(items.amount))}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
