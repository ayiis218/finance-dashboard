export const dynamic = "force-dynamic";

import Link from "next/link";
import { format, parse } from "date-fns";
import { ArrowLeft, Pencil } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { CashflowFormFields } from "@/components/cashflow/cashflow-form-fields";
import { CashflowBudgetItemFormFields } from "@/components/cashflow/cashflow-budget-item-form-fields";
import { getCashflowMonthDetail } from "@/lib/queries/cashflow";
import {
  setCashflowMonth,
  createCashflowBudgetItem,
  updateCashflowBudgetItem,
  deleteCashflowBudgetItem,
} from "@/lib/actions/cashflow";
import { formatIDR } from "@/lib/format";

export default async function CashflowMonthPage({
  params,
}: Readonly<{ params: Promise<{ month: string }> }>) {
  const { month: monthSlug } = await params;
  const month = parse(monthSlug, "yyyy-MM", new Date());
  const monthLabel = format(month, "MMMM yyyy");
  const detail = await getCashflowMonthDetail(month);

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <Link
        href="/cashflow"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Cashflow
      </Link>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>{monthLabel}</CardTitle>
            <CardDescription>This month&apos;s balance &amp; income</CardDescription>
          </div>
          <FormDialog
            title={`Balance — ${monthLabel}`}
            triggerLabel="Edit Balance"
            triggerVariant="outline"
            action={setCashflowMonth}
          >
            <CashflowFormFields
              idPrefix="month"
              month={month.toISOString()}
              monthLabel={monthLabel}
              defaults={{
                saldoAwal: detail.saldoAwal,
                monthlyIncome: detail.monthlyIncome,
                saldoAkhirActual: detail.saldoAkhirActual,
              }}
            />
          </FormDialog>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Starting Balance</p>
            <p className="text-lg font-semibold">{formatIDR(detail.saldoAwal)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Income</p>
            <p className="text-lg font-semibold">{formatIDR(detail.monthlyIncome)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ending Balance (Actual)</p>
            <p className="text-lg font-semibold">
              {detail.saldoAkhirActual != null ? formatIDR(detail.saldoAkhirActual) : "-"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Budget Breakdown</CardTitle>
            <CardDescription>Total Budget: {formatIDR(detail.totalBudget)}</CardDescription>
          </div>
          <FormDialog title="Add Budget Item" triggerLabel="Add Item" action={createCashflowBudgetItem}>
            <CashflowBudgetItemFormFields idPrefix="new" month={month.toISOString()} />
          </FormDialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {detail.budgetItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span>{item.label}</span>
              <div className="flex items-center gap-2">
                <span>{formatIDR(item.amount)}</span>
                <FormDialog
                  title="Edit Budget Item"
                  triggerIcon={<Pencil className="size-4" />}
                  triggerVariant="ghost"
                  triggerSize="icon"
                  action={updateCashflowBudgetItem.bind(null, item.id, month)}
                >
                  <CashflowBudgetItemFormFields
                    idPrefix={item.id}
                    defaults={{ label: item.label, amount: item.amount }}
                  />
                </FormDialog>
                <DeleteButton action={deleteCashflowBudgetItem.bind(null, item.id, month)} />
              </div>
            </div>
          ))}
          {detail.budgetItems.length === 0 && (
            <p className="text-sm text-muted-foreground">No budget items yet this month.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="text-lg font-semibold">{formatIDR(detail.totalBudget)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Net Savings</p>
            <p
              className={
                "text-lg font-semibold " +
                (detail.amountSave >= 0 ? "text-positive" : "text-destructive")
              }
            >
              {formatIDR(detail.amountSave)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ending Balance (Expected)</p>
            <p className="text-lg font-semibold">{formatIDR(detail.saldoAkhirExpected)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Variance</p>
            <p
              className={
                "text-lg font-semibold " +
                (detail.variance == null
                  ? "text-muted-foreground"
                  : detail.variance >= 0
                    ? "text-positive"
                    : "text-destructive")
              }
            >
              {detail.variance != null
                ? `${detail.variance > 0 ? "+" : ""}${formatIDR(detail.variance)}`
                : "-"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
