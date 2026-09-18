export const dynamic = "force-dynamic";

import { format, parse } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { MonthNav } from "@/components/month-nav";
import { BudgetCategoryFormFields } from "@/components/budget/budget-category-form-fields";
import { BudgetCategoryTable } from "@/components/budget/budget-category-table";
import { BudgetEntryTable } from "@/components/budget/budget-entry-table";
import { getBudgetCategories, getBudgetOverview } from "@/lib/queries";
import { createBudgetCategory } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function BudgetPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ month?: string }> }>) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ? parse(monthParam, "yyyy-MM", new Date()) : new Date();

  const [categories, overview] = await Promise.all([
    getBudgetCategories(),
    getBudgetOverview(month),
  ]);

  const remainingBudget = overview.totals.planned - overview.totals.actual;

  const summaryItems = [
    { label: "Total Planned", value: formatIDR(overview.totals.planned) },
    { label: "Total Expected", value: formatIDR(overview.totals.expectation) },
    { label: "Total Actual", value: formatIDR(overview.totals.actual) },
    {
      label: "Remaining Budget",
      value: formatIDR(remainingBudget),
      tone: remainingBudget >= 0 ? ("highlight" as const) : ("negative" as const),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Budget</CardTitle>
          <FormDialog title="Add Category" triggerLabel="Add" action={createBudgetCategory}>
            <BudgetCategoryFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <BudgetCategoryTable rows={categories} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Monthly Actuals</CardTitle>
            <CardDescription>{format(month, "MMMM yyyy")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <MonthNav month={month} baseHref="/budget" />
          <BudgetEntryTable rows={overview.rows} monthIso={overview.month.toISOString()} />
        </CardContent>
      </Card>
    </div>
  );
}
