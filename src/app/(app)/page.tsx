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

  const summaryCards = [
    { label: "Total Saldo", value: summary.totalSaldo },
    { label: "Total Aset", value: summary.totalAset },
    { label: "Total Investasi", value: summary.totalInvestasi },
    { label: "Total Utang", value: summary.totalUtang },
    {
      label: "Sisa Anggaran Bulan Ini",
      value: budgetOverview.totals.planned - budgetOverview.totals.actual,
    },
    { label: "Net Worth", value: summary.netWorth, highlight: true },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {summaryCards.map((card) =>
          card.highlight ? (
            <Card key={card.label} className="bg-brand-gradient border-none text-white">
              <CardHeader className="pb-2">
                <CardDescription className="text-white/80">{card.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatIDR(card.value)}</p>
              </CardContent>
            </Card>
          ) : (
            <Card
              key={card.label}
              className="bg-gradient-to-br from-primary/5 via-card to-accent/10"
            >
              <CardHeader className="pb-2">
                <CardDescription>{card.label}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatIDR(card.value)}</p>
              </CardContent>
            </Card>
          ),
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Perbandingan Pengeluaran Bulanan</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
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
              <Badge variant="secondary" className="text-green-600">
                {formatIDR(daily.income)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Pengeluaran
              </span>
              <Badge variant="secondary" className="text-red-600">
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
                        items.type === "INCOME" ? "text-green-600" : "text-red-600"
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
