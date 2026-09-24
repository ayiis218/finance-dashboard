export const dynamic = "force-dynamic";

import Link from "next/link";
import { parse, startOfMonth, endOfMonth, format } from "date-fns";
import { Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { MonthNav } from "@/components/month-nav";
import { PageNav } from "@/components/page-nav";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionFormFields } from "@/components/transactions/transaction-form-fields";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { CategoryBreakdownCards } from "@/components/transactions/category-breakdown-cards";
import { getBankAccounts } from "@/lib/queries/accounts";
import {
  getCategoryBreakdown,
  getDistinctCategories,
  getTransactionsFiltered,
  getTransactionsMonthlyTotals,
} from "@/lib/queries/transactions";
import { createTransaction } from "@/lib/actions/transactions";
import { formatIDR } from "@/lib/format";

export default async function TransactionsPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ month?: string; q?: string; type?: string; accountId?: string; page?: string }>;
}>) {
  const { month: monthParam, q, type, accountId, page: pageParam } = await searchParams;
  const month = monthParam ? parse(monthParam, "yyyy-MM", new Date()) : new Date();
  const page = Number(pageParam) || 1;
  const validType = type === "INCOME" || type === "EXPENSE" || type === "TRANSFER" ? type : undefined;

  const categoryFilters: Parameters<typeof getCategoryBreakdown>[0] = {
    from: startOfMonth(month),
    to: endOfMonth(month),
    q,
    type: validType,
    accountId,
  };

  const [result, accountRows, categories, categoryBreakdown, monthlyTotals] = await Promise.all([
    getTransactionsFiltered({ month, q, type: validType, accountId, page }),
    getBankAccounts(),
    getDistinctCategories(),
    getCategoryBreakdown(categoryFilters),
    getTransactionsMonthlyTotals({ month, q, accountId }),
  ]);
  const { expenseByCategory, spendingDetailed } = categoryBreakdown;

  // Plain, serializable shape — some children (TransactionFilters) are Client
  // Components, and Prisma's Decimal fields can't cross that boundary.
  const accounts = accountRows.map((a) => ({ id: a.id, name: a.name }));

  const { transactions } = result;
  const { income: monthlyIncome, expense: monthlyExpense } = monthlyTotals;

  const summaryItems = [
    {
      label: "Expense This Month",
      description: "Total uang keluar bulan ini (tipe Pengeluaran)",
      value: formatIDR(monthlyExpense),
      tone: "negative" as const,
    },
    {
      label: "Net This Month",
      description: "Pemasukan dikurangi pengeluaran bulan ini",
      value: formatIDR(monthlyIncome - monthlyExpense),
      tone: "highlight" as const,
    },
    {
      label: "Number of Transactions",
      description: "Banyaknya transaksi yang tercatat bulan ini (sesuai filter)",
      value: String(result.total),
    },
  ];

  const extraParams = { q, type: validType, accountId };
  const categoryRangeLabel = format(month, "MMMM yyyy");

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center [&>*]:w-full sm:[&>*]:w-auto">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/transactions/import" />}
            >
              <Upload className="size-4" />
              Import CSV
            </Button>
            <FormDialog title="Add Transaction" triggerLabel="Add" action={createTransaction}>
              <TransactionFormFields idPrefix="new" accounts={accounts} categories={categories} />
            </FormDialog>
          </div>
        </CardHeader>
        <CardContent>
          <MonthNav month={month} baseHref="/transactions" extraParams={extraParams} />
          <TransactionFilters accounts={accounts} />
          <TransactionTable
            rows={transactions}
            page={result.page}
            pageSize={result.pageSize}
            accounts={accounts}
            categories={categories}
          />
          <PageNav
            page={result.page}
            totalPages={result.totalPages}
            baseHref="/transactions"
            extraParams={{ ...extraParams, month: monthParam }}
          />
        </CardContent>
      </Card>

      <CategoryBreakdownCards
        rangeLabel={categoryRangeLabel}
        expenseByCategory={expenseByCategory}
        spendingDetailed={spendingDetailed}
      />
    </div>
  );
}
