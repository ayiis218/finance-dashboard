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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { GoalItemStatusBadge } from "@/components/goal-item-status";
import { getGoalDetail } from "@/lib/queries";
import {
  addSavingsGoalEntry,
  createGoalItem,
  deleteGoalItem,
  updateGoalItem,
  updateGoalItemStatus,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function GoalDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const { goal, categories, totalSaved, totalBudgeted } = await getGoalDetail(id);
  const target = Number(goal.targetAmount);
  const progress = target > 0 ? Math.min(100, (totalSaved / target) * 100) : 0;

  return (
    <div className="space-y-4">
      <Link
        href="/goals"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Savings Goal
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{goal.name}</CardTitle>
          <CardDescription>
            Tenor {goal.tenorMonths} bulan &middot; target {formatIDR(target)}
            {totalBudgeted > 0 && " (mengikuti total rincian)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{formatIDR(totalSaved)} tertabung</span>
            <span className="text-muted-foreground">dari {formatIDR(target)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Rincian Anggaran</CardTitle>
            <CardDescription>
              Total rincian: {formatIDR(totalBudgeted)}
              {totalBudgeted > target && target > 0 && (
                <span className="text-destructive"> — melebihi target awal</span>
              )}
            </CardDescription>
          </div>
          <FormDialog
            title="Tambah Rincian"
            triggerLabel="Tambah Rincian"
            action={createGoalItem}
          >
            <input type="hidden" name="goalId" value={goal.id} />
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input
                id="category"
                name="category"
                placeholder="Mahar, Catering, THR, Individu, dll"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Nama Rincian</Label>
              <Input
                id="name"
                name="name"
                placeholder="Cincin, Fotografer, nama orang, dll"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetAmount">Anggaran</Label>
              <Input id="budgetAmount" name="budgetAmount" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Catatan</Label>
              <Input id="note" name="note" placeholder="Opsional" />
            </div>
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
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <div className="flex flex-col">
                      <span>{item.name}</span>
                      {item.note && (
                        <span className="text-xs text-muted-foreground">
                          {item.note}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span>{formatIDR(Number(item.budgetAmount))}</span>
                      <GoalItemStatusBadge
                        status={item.status}
                        onChange={updateGoalItemStatus.bind(null, item.id, goal.id)}
                      />
                      <FormDialog
                        title="Edit Rincian"
                        triggerIcon={<Pencil className="size-4" />}
                        triggerVariant="ghost"
                        triggerSize="icon"
                        action={updateGoalItem.bind(null, item.id, goal.id)}
                      >
                        <input type="hidden" name="goalId" value={goal.id} />
                        <div className="space-y-2">
                          <Label htmlFor={`category-${item.id}`}>Kategori</Label>
                          <Input
                            id={`category-${item.id}`}
                            name="category"
                            defaultValue={item.category}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`name-${item.id}`}>Nama Rincian</Label>
                          <Input
                            id={`name-${item.id}`}
                            name="name"
                            defaultValue={item.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`budgetAmount-${item.id}`}>Anggaran</Label>
                          <Input
                            id={`budgetAmount-${item.id}`}
                            name="budgetAmount"
                            type="number"
                            defaultValue={Number(item.budgetAmount)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`note-${item.id}`}>Catatan</Label>
                          <Input
                            id={`note-${item.id}`}
                            name="note"
                            defaultValue={item.note ?? ""}
                            placeholder="Opsional"
                          />
                        </div>
                      </FormDialog>
                      <DeleteButton
                        action={deleteGoalItem.bind(null, item.id, goal.id)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada rincian anggaran untuk goal ini.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tabungan Bulanan</CardTitle>
          <FormDialog
            title="Catat Tabungan"
            triggerLabel="Catat Tabungan"
            action={addSavingsGoalEntry}
          >
            <input type="hidden" name="goalId" value={goal.id} />
            <div className="space-y-2">
              <Label htmlFor="month">Bulan</Label>
              <Input
                id="month"
                name="month"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah</Label>
              <Input id="amount" name="amount" type="number" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contributor">Kontributor</Label>
              <Input
                id="contributor"
                name="contributor"
                placeholder="Opsional, mis. nama Anda / pasangan"
              />
            </div>
          </FormDialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {goal.entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {entry.month.toLocaleDateString("id-ID", {
                  month: "long",
                  year: "numeric",
                })}
                {entry.contributor && (
                  <span className="text-muted-foreground"> &middot; {entry.contributor}</span>
                )}
              </span>
              <span>{formatIDR(Number(entry.amount))}</span>
            </div>
          ))}
          {goal.entries.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada tabungan tercatat.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
