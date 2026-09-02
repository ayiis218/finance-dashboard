export const dynamic = "force-dynamic";

import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { GoalFormFields } from "@/components/goals/goal-form-fields";
import { GoalCard } from "@/components/goals/goal-card";
import { prisma } from "@/lib/prisma";
import { createSavingsGoal } from "@/lib/actions";
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
      <div className="bg-brand-gradient flex flex-col items-start gap-3 rounded-lg px-4 py-3 text-white sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold">Savings Goal (Wedding, Eid, dll)</h1>
        <FormDialog
          title="Tambah Savings Goal"
          triggerLabel="Tambah Goal"
          triggerVariant="outline"
          action={createSavingsGoal}
        >
          <GoalFormFields idPrefix="new" />
        </FormDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}

        {goals.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Belum ada savings goal. Tambahkan goal seperti &quot;Wedding&quot; atau &quot;Eid
            2026&quot; untuk mulai menabung.
          </p>
        )}
      </div>
    </div>
  );
}
