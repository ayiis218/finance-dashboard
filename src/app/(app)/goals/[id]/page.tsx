export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { GoalItemStatusBadge } from "@/components/goals/goal-item-status";
import { GoalItemFormFields } from "@/components/goals/goal-item-form-fields";
import { getGoalDetail } from "@/lib/queries";
import {
  addSavingsGoalEntry,
  createGoalItem,
  deleteGoalItem,
  updateGoalItem,
  updateGoalItemStatus,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/number-input";

export default async function GoalDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { goal, categories, totalSaved, totalBudgeted } = await getGoalDetail(id);
  const target = Number(goal.targetAmount);
  const progress = target > 0 ? Math.min(100, (totalSaved / target) * 100) : 0;

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <Link
        href="/goals"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Savings Goal
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{goal.name}</CardTitle>
          <CardDescription>
            Tenor {goal.tenorMonths} months &middot; target {formatIDR(target)}
            {totalBudgeted > 0 && " (mengikuti total rincian)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{formatIDR(totalSaved)} saved</span>
            <span className="text-muted-foreground">of {formatIDR(target)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Budget Breakdown</CardTitle>
            <CardDescription>
              Total rincian: {formatIDR(totalBudgeted)}
              {totalBudgeted > target && target > 0 && (
                <span className="text-destructive"> — melebihi target awal</span>
              )}
            </CardDescription>
          </div>
          <FormDialog title="Add Item" triggerLabel="Add Item" action={createGoalItem}>
            <GoalItemFormFields idPrefix="new" goalId={goal.id} />
          </FormDialog>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map((cat) => (
            <div key={cat.category} className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>{cat.category}</span>
                <span className="text-muted-foreground">{formatIDR(cat.total)}</span>
              </div>
              <div className="space-y-1">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-md border px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.note && (
                        <span className="text-xs text-muted-foreground">{item.note}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span>{formatIDR(Number(item.budgetAmount))}</span>
                      <GoalItemStatusBadge
                        status={item.status}
                        onChange={updateGoalItemStatus.bind(null, item.id, goal.id)}
                      />
                      <FormDialog
                        title="Edit Item"
                        triggerIcon={<Pencil className="size-4" />}
                        triggerVariant="ghost"
                        triggerSize="icon"
                        action={updateGoalItem.bind(null, item.id, goal.id)}
                      >
                        <GoalItemFormFields
                          idPrefix={item.id}
                          goalId={goal.id}
                          defaults={{
                            category: item.category,
                            name: item.name,
                            budgetAmount: Number(item.budgetAmount),
                            actualAmount: Number(item.actualAmount ?? 0),
                            note: item.note,
                          }}
                        />
                      </FormDialog>
                      <DeleteButton action={deleteGoalItem.bind(null, item.id, goal.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No budget items for this goal yet.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Monthly Savings</CardTitle>
          <FormDialog title="Log Savings" triggerLabel="Log Savings" action={addSavingsGoalEntry}>
            <input type="hidden" name="goalId" value={goal.id} />
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                name="month"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <NumberInput id="amount" name="amount" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contributor">Contributor</Label>
              <Input
                id="contributor"
                name="contributor"
                placeholder="Optional, e.g. your name / partner"
              />
            </div>
          </FormDialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {goal.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <span>
                {entry.month.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                {entry.contributor && (
                  <span className="text-muted-foreground"> &middot; {entry.contributor}</span>
                )}
              </span>
              <span>{formatIDR(Number(entry.amount))}</span>
            </div>
          ))}
          {goal.entries.length === 0 && (
            <p className="text-sm text-muted-foreground">No savings logged yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
