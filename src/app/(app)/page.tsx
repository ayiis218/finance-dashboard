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
import { DateRangeFilter, parseDateRangeParams } from "@/components/date-range-filter";
import { getDailySummary, getSummary } from "@/lib/queries/dashboard";
import { getMonthlyExpenseComparison } from "@/lib/queries/transactions";
import { formatIDR } from "@/lib/format";
import { format, startOfMonth, subMonths } from "date-fns";

export default async function DashboardPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ from?: string; to?: string }> }>) {
  const { from: fromParam, to: toParam } = await searchParams;
  const { from, to } = parseDateRangeParams(
    fromParam,
    toParam,
    startOfMonth(subMonths(new Date(), 5)),
  );
  const rangeLabel = `${format(from, "d MMM yyyy")} – ${format(to, "d MMM yyyy")}`;

  const [summary, daily, monthlyExpense] = await Promise.all([
    getSummary(),
    getDailySummary(),
    getMonthlyExpenseComparison({ from, to }),
  ]);

  const totalExpenseRange = monthlyExpense.reduce((sum, m) => sum + m.total, 0);
  const avgExpensePerMonth =
    monthlyExpense.length > 0 ? totalExpenseRange / monthlyExpense.length : 0;

  const netWorthItem: SummaryStatItem[] = [
    {
      label: "Net Worth",
      description: "Saldo + aset + investasi + piutang, dikurangi utang",
      value: formatIDR(summary.netWorth),
      tone: "highlight",
    },
  ];

  const compactItems: SummaryStatItem[] = [
    { label: "Total Balance", value: formatIDR(summary.totalBalance) },
    { label: "Total Assets", value: formatIDR(summary.totalAssets) },
    { label: "Total Investments", value: formatIDR(summary.totalInvestments) },
    {
      label: "Total Debt",
      value: formatIDR(summary.totalDebt),
      tone: summary.totalDebt > 0 ? "negative" : "default",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={netWorthItem} />
      <SummaryStats items={compactItems} compact />

      <DateRangeFilter from={from} to={to} baseHref="/" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Monthly Expense Comparison</CardTitle>
            <CardDescription>
              {rangeLabel} — Total {formatIDR(totalExpenseRange)}, rata-rata{" "}
              {formatIDR(avgExpensePerMonth)}/bulan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyExpenseChartLazy data={monthlyExpense} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
            <CardTitle>Today&apos;s Summary</CardTitle>
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
              <span className="text-sm text-muted-foreground">Income</span>
              <Badge variant="secondary" className="text-positive">
                {formatIDR(daily.income)}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Expense
              </span>
              <Badge variant="secondary" className="text-destructive">
                {formatIDR(daily.expense)}
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              {daily.transactions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No transactions today.
                </p>
              )}
              {daily.transactions.map((transaction) => {
                const category = transaction?.note
                  ? `${transaction.category} - ${transaction.note}`
                  : transaction.category;
                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{category}</span>
                    <span
                      className={
                        transaction.type === "INCOME" ? "text-positive" : "text-destructive"
                      }
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatIDR(Number(transaction.amount))}
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
