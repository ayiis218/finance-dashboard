export const dynamic = "force-dynamic";

import Link from "next/link";
import { parse, formatDate } from "date-fns";
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
import { prisma } from "@/lib/prisma";
import {
  getDistinctCategories,
  getLatestTransaction,
  getTransactionsFiltered,
} from "@/lib/queries";
import { createTransaction } from "@/lib/actions";
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

  const [result, accountRows, categories, latestTransaction] = await Promise.all([
    getTransactionsFiltered({ month, q, type: validType, accountId, page }),
    prisma.bankAccount.findMany(),
    getDistinctCategories(),
    getLatestTransaction(),
  ]);

  // Plain, serializable shape — some children (TransactionFilters) are Client
  // Components, and Prisma's Decimal fields can't cross that boundary.
  const accounts = accountRows.map((a) => ({ id: a.id, name: a.name }));

  const { transactions } = result;

  const monthlyIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const spendingByCategory = new Map<string, number>();
  for (const t of transactions) {
    if (t.type === "EXPENSE" || (t.type === "TRANSFER" && !t.toAccountId)) {
      spendingByCategory.set(
        t.category,
        (spendingByCategory.get(t.category) ?? 0) + Number(t.amount),
      );
    }
  }
  const topCategory = Array.from(spendingByCategory.entries()).reduce<
    { category: string; total: number } | null
  >((top, [category, total]) => (!top || total > top.total ? { category, total } : top), null);

  const summaryItems = [
    {
      label: "Income This Month",
      description: "Total uang masuk bulan ini",
      value: formatIDR(monthlyIncome),
      tone: "positive" as const,
    },
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
    topCategory
      ? {
          label: "Top Category",
          description: "Pengeluaran & transfer terbesar bulan ini",
          value: formatIDR(topCategory.total),
          sublabel: topCategory.category,
        }
      : {
          label: "Top Category",
          description: "Pengeluaran & transfer terbesar bulan ini",
          value: "-",
          sublabel: "No data yet",
        },
    latestTransaction
      ? {
          label: "Latest Transaction",
          description: "Transaksi paling baru yang tercatat (semua bulan)",
          value: formatIDR(Number(latestTransaction.amount)),
          sublabel: `${latestTransaction.category} · ${formatDate(latestTransaction.date, "dd MMM yyyy")}`,
        }
      : {
          label: "Latest Transaction",
          description: "Transaksi paling baru yang tercatat (semua bulan)",
          value: "-",
          sublabel: "No transactions yet",
        },
  ];

  const extraParams = { q, type: validType, accountId };

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Transactions</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
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
    </div>
  );
}
