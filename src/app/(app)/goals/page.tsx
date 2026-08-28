export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { prisma } from "@/lib/prisma";
import {
  addSavingsGoalEntry,
  createSavingsGoal,
  deleteSavingsGoal,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function GoalsPage() {
  const goals = await prisma.savingsGoal.findMany({
    include: { entries: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          Savings Goal (Wedding, Eid, dll)
        </h1>
        <FormDialog
          title="Tambah Savings Goal"
          triggerLabel="Tambah Goal"
          action={createSavingsGoal}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama Goal</Label>
            <Input id="name" name="name" placeholder="Wedding, Eid 2026, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAmount">Target Dana</Label>
            <Input id="targetAmount" name="targetAmount" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tenorMonths">Tenor (bulan)</Label>
            <Input id="tenorMonths" name="tenorMonths" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startDate">Mulai Menabung</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>
        </FormDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const saved = goal.entries.reduce(
            (sum, e) => sum + Number(e.amount),
            0,
          );
          const target = Number(goal.targetAmount);
          const progress = target > 0 ? Math.min(100, (saved / target) * 100) : 0;
          const monthlyTarget = target / goal.tenorMonths;

          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{goal.name}</CardTitle>
                  <CardDescription>
                    Tenor {goal.tenorMonths} bulan &middot; target{" "}
                    {formatIDR(monthlyTarget)}/bulan
                  </CardDescription>
                </div>
                <DeleteButton action={deleteSavingsGoal.bind(null, goal.id)} />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{formatIDR(saved)}</span>
                  <span className="text-muted-foreground">
                    dari {formatIDR(target)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <FormDialog
                  title={`Tambah Tabungan - ${goal.name}`}
                  triggerLabel="Catat Tabungan Bulan Ini"
                  action={addSavingsGoalEntry}
                >
                  <input type="hidden" name="goalId" value={goal.id} />
                  <div className="space-y-2">
                    <Label htmlFor={`month-${goal.id}`}>Bulan</Label>
                    <Input
                      id={`month-${goal.id}`}
                      name="month"
                      type="date"
                      defaultValue={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`amount-${goal.id}`}>Jumlah</Label>
                    <Input
                      id={`amount-${goal.id}`}
                      name="amount"
                      type="number"
                      required
                    />
                  </div>
                </FormDialog>
              </CardContent>
            </Card>
          );
        })}

        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada savings goal. Tambahkan goal seperti &quot;Wedding&quot; atau
            &quot;Eid 2026&quot; untuk mulai menabung.
          </p>
        )}
      </div>
    </div>
  );
}
