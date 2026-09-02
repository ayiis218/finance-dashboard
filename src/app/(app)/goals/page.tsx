export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SummaryStats } from "@/components/summary-stats";
import { prisma } from "@/lib/prisma";
import { createSavingsGoal, deleteSavingsGoal, updateSavingsGoal } from "@/lib/actions";
import { format } from "date-fns";
import { formatIDR } from "@/lib/format";

export default async function GoalsPage() {
  const goals = await prisma.savingsGoal.findMany({
    include: { entries: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);
  const totalSaved = goals.reduce(
    (sum, g) => sum + g.entries.reduce((s, e) => s + Number(e.amount), 0),
    0,
  );
  const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const summaryItems = [
    { label: "Total Target Semua Goal", value: formatIDR(totalTarget) },
    {
      label: "Total Tertabung",
      value: formatIDR(totalSaved),
      sublabel: `${overallProgress.toFixed(1)}% dari target`,
      tone: "highlight" as const,
    },
    { label: "Jumlah Goal Aktif", value: String(goals.length) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <div className="bg-brand-gradient flex items-center justify-between rounded-lg px-4 py-3 text-white">
        <h1 className="text-lg font-semibold">
          Savings Goal (Wedding, Eid, dll)
        </h1>
        <FormDialog
          title="Tambah Savings Goal"
          triggerLabel="Tambah Goal"
          triggerVariant="outline"
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
          const totalBudgeted = goal.items.reduce(
            (sum, i) => sum + Number(i.budgetAmount),
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
                <div className="flex items-center gap-1">
                  <FormDialog
                    title="Edit Savings Goal"
                    triggerIcon={<Pencil className="size-4" />}
                    triggerVariant="ghost"
                    triggerSize="icon"
                    action={updateSavingsGoal.bind(null, goal.id)}
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`name-${goal.id}`}>Nama Goal</Label>
                      <Input
                        id={`name-${goal.id}`}
                        name="name"
                        defaultValue={goal.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`targetAmount-${goal.id}`}>Target Dana</Label>
                      <Input
                        id={`targetAmount-${goal.id}`}
                        name="targetAmount"
                        type="number"
                        defaultValue={target}
                        required
                      />
                      {goal.items.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Goal ini punya rincian anggaran — target akan otomatis
                          menyesuaikan lagi begitu rincian ditambah/dihapus.
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`tenorMonths-${goal.id}`}>Tenor (bulan)</Label>
                      <Input
                        id={`tenorMonths-${goal.id}`}
                        name="tenorMonths"
                        type="number"
                        defaultValue={goal.tenorMonths}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`startDate-${goal.id}`}>Mulai Menabung</Label>
                      <Input
                        id={`startDate-${goal.id}`}
                        name="startDate"
                        type="date"
                        defaultValue={format(goal.startDate, "yyyy-MM-dd")}
                        required
                      />
                    </div>
                  </FormDialog>
                  <DeleteButton action={deleteSavingsGoal.bind(null, goal.id)} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>{formatIDR(saved)} tertabung</span>
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
                {goal.items.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {goal.items.length} rincian anggaran &middot; total{" "}
                    {formatIDR(totalBudgeted)}
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
