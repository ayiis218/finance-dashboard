export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MonthlyExpenseChart } from "@/components/charts/monthly-expense-chart";
import {
  getDailySummary,
  getMonthlyExpenseComparison,
  getSummary,
} from "@/lib/queries";
import { formatIDR } from "@/lib/format";

export default async function DashboardPage() {
  const [summary, daily, monthlyExpense] = await Promise.all([
    getSummary(),
    getDailySummary(),
    getMonthlyExpenseComparison(),
  ]);

  const summaryCards = [
    { label: "Total Saldo", value: summary.totalSaldo },
    { label: "Total Aset", value: summary.totalAset },
    { label: "Total Investasi", value: summary.totalInvestasi },
    { label: "Total Utang", value: summary.totalUtang },
    { label: "Net Worth", value: summary.netWorth, highlight: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <p
                className={
                  card.highlight
                    ? "text-2xl font-semibold text-primary"
                    : "text-2xl font-semibold"
                }
              >
                {formatIDR(card.value)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perbandingan Pengeluaran Bulanan</CardTitle>
            <CardDescription>6 bulan terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyExpenseChart data={monthlyExpense} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
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
              {daily.transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{t.category}</span>
                  <span
                    className={
                      t.type === "INCOME" ? "text-green-600" : "text-red-600"
                    }
                  >
                    {t.type === "INCOME" ? "+" : "-"}
                    {formatIDR(Number(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
