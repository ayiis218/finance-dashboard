import Link from "next/link";
import { format } from "date-fns";
import { Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { GoalFormFields } from "@/components/goals/goal-form-fields";
import { updateSavingsGoal, deleteSavingsGoal } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

type GoalRow = {
  id: string;
  name: string;
  targetAmount: unknown;
  tenorMonths: number;
  startDate: Date;
  entries: { amount: unknown }[];
  items: { budgetAmount: unknown }[];
};

export function GoalCard({ goal }: Readonly<{ goal: GoalRow }>) {
  const saved = goal.entries.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalBudgeted = goal.items.reduce((sum, i) => sum + Number(i.budgetAmount), 0);
  const target = Number(goal.targetAmount);
  const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
  const monthlyTarget = target / goal.tenorMonths;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{goal.name}</CardTitle>
          <CardDescription>
            Tenor {goal.tenorMonths} bulan &middot; target {formatIDR(monthlyTarget)}/bulan
          </CardDescription>
        </div>
        <div className="flex items-center gap-1">
          <FormDialog
            title="Edit Savings Goal"
            triggerIcon={<Pencil className="size-4" />}
            triggerVariant="ghost"
            triggerSize="icon"
            action={updateSavingsGoal.bind(null, goal.id)}
          >
            <GoalFormFields
              idPrefix={goal.id}
              defaults={{
                name: goal.name,
                targetAmount: target,
                tenorMonths: goal.tenorMonths,
                startDate: format(goal.startDate, "yyyy-MM-dd"),
                hasItems: goal.items.length > 0,
              }}
            />
          </FormDialog>
          <DeleteButton action={deleteSavingsGoal.bind(null, goal.id)} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>{formatIDR(saved)} tertabung</span>
          <span className="text-muted-foreground">dari {formatIDR(target)}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {goal.items.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {goal.items.length} rincian anggaran &middot; total {formatIDR(totalBudgeted)}
          </p>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          nativeButton={false}
          render={<Link href={`/goals/${goal.id}`} />}
        >
          Lihat Detail &amp; Rincian
        </Button>
      </CardContent>
    </Card>
  );
}
