export const dynamic = "force-dynamic";

import { Pencil } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SummaryStats } from "@/components/summary-stats";
import { YearNav } from "@/components/year-nav";
import { CashflowTable } from "@/components/cashflow/cashflow-table";
import { AllocationTemplateFormFields } from "@/components/cashflow/allocation-template-form-fields";
import { CashflowBudgetItemFormFields } from "@/components/cashflow/cashflow-budget-item-form-fields";
import { getCashflowAllocationTemplate, getCashflowYearOverview } from "@/lib/queries/cashflow";
import {
  setCashflowAllocationTemplate,
  createAllocationTemplateItem,
  updateAllocationTemplateItem,
  deleteAllocationTemplateItem,
} from "@/lib/actions/cashflow";
import { formatIDR } from "@/lib/format";

export default async function CashflowPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ year?: string }> }>) {
  const { year: yearParam } = await searchParams;
  const year = yearParam ? Number(yearParam) : new Date().getFullYear();

  const [{ rows }, template] = await Promise.all([
    getCashflowYearOverview(year),
    getCashflowAllocationTemplate(),
  ]);
  const december = rows[11];
  const totalVariance = rows.reduce((sum, r) => sum + (r.variance ?? 0), 0);
  const hasAnyActual = rows.some((r) => r.saldoAkhirActual != null);
  const templateTotalBudget = template.items.reduce((sum, i) => sum + i.amount, 0);
  const templateNetSavings = template.monthlyIncome - templateTotalBudget;

  const summaryItems = [
    { label: "Starting Balance (Year)", value: formatIDR(rows[0].saldoAwal) },
    {
      label: "Ending Balance Expected (Dec)",
      value: formatIDR(december.saldoAkhirExpected),
      tone: "highlight" as const,
    },
    {
      label: "Ending Balance Actual (Dec)",
      value: december.saldoAkhirActual != null ? formatIDR(december.saldoAkhirActual) : "-",
    },
    {
      label: "Total Variance (Year)",
      value: hasAnyActual
        ? `${totalVariance > 0 ? "+" : ""}${formatIDR(totalVariance)}`
        : "-",
      tone: hasAnyActual ? (totalVariance >= 0 ? ("positive" as const) : ("negative" as const)) : undefined,
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />

      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Default Monthly Allocation</CardTitle>
            <CardDescription>
              Starting point for months you haven&apos;t saved yet — editing this never changes
              months already saved.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <FormDialog
              title="Edit Default Income"
              triggerLabel="Edit Income"
              triggerVariant="outline"
              action={setCashflowAllocationTemplate}
            >
              <AllocationTemplateFormFields idPrefix="template" defaultMonthlyIncome={template.monthlyIncome} />
            </FormDialog>
            <FormDialog title="Add Default Budget Item" triggerLabel="Add Item" action={createAllocationTemplateItem}>
              <CashflowBudgetItemFormFields idPrefix="new-template" />
            </FormDialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Monthly Income</p>
              <p className="text-lg font-semibold">{formatIDR(template.monthlyIncome)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Net Monthly Savings (default)</p>
              <p
                className={
                  "text-lg font-semibold " +
                  (templateNetSavings >= 0 ? "text-positive" : "text-destructive")
                }
              >
                {formatIDR(templateNetSavings)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {template.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <span>{item.label}</span>
                <div className="flex items-center gap-2">
                  <span>{formatIDR(item.amount)}</span>
                  <FormDialog
                    title="Edit Default Item"
                    triggerIcon={<Pencil className="size-4" />}
                    triggerVariant="ghost"
                    triggerSize="icon"
                    action={updateAllocationTemplateItem.bind(null, item.id)}
                  >
                    <CashflowBudgetItemFormFields
                      idPrefix={item.id}
                      defaults={{ label: item.label, amount: item.amount }}
                    />
                  </FormDialog>
                  <DeleteButton action={deleteAllocationTemplateItem.bind(null, item.id)} />
                </div>
              </div>
            ))}
            {template.items.length === 0 && (
              <p className="text-sm text-muted-foreground">No default budget items yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Cashflow Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <YearNav year={year} baseHref="/cashflow" />
          <CashflowTable rows={rows} />
        </CardContent>
      </Card>
    </div>
  );
}
