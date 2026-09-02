export const dynamic = "force-dynamic";

import Link from "next/link";
import { addMonths, format, parse, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SummaryStats } from "@/components/summary-stats";
import { getBudgetCategories, getBudgetOverview } from "@/lib/queries";
import {
  createBudgetCategory,
  createBudgetEntry,
  deleteBudgetCategory,
  deleteBudgetEntry,
  updateBudgetCategory,
  updateBudgetEntry,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";

function budgetStatus(
  actual: number,
  minTarget: number | null,
  maxTarget: number | null,
) {
  if (minTarget != null && actual < minTarget) {
    return { label: "Di Bawah Target", variant: "destructive" as const };
  }
  if (maxTarget != null && actual > maxTarget) {
    return { label: "Melebihi Target", variant: "destructive" as const };
  }
  if (minTarget == null && maxTarget == null) return null;
  return { label: "Sesuai Target", variant: "default" as const };
}

export default async function BudgetPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ month?: string }> }>) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ? parse(monthParam, "yyyy-MM", new Date()) : new Date();

  const [categories, overview] = await Promise.all([
    getBudgetCategories(),
    getBudgetOverview(month),
  ]);

  const prevMonth = format(subMonths(month, 1), "yyyy-MM");
  const nextMonth = format(addMonths(month, 1), "yyyy-MM");

  const sisaAnggaran = overview.totals.planned - overview.totals.actual;

  const summaryItems = [
    { label: "Total Rencana", value: formatIDR(overview.totals.planned) },
    { label: "Total Ekspektasi", value: formatIDR(overview.totals.expectation) },
    { label: "Total Aktual", value: formatIDR(overview.totals.actual) },
    {
      label: "Sisa Anggaran",
      value: formatIDR(sisaAnggaran),
      tone: sisaAnggaran >= 0 ? ("highlight" as const) : ("negative" as const),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Kategori Anggaran</CardTitle>
          <FormDialog
            title="Tambah Kategori"
            triggerLabel="Tambah"
            action={createBudgetCategory}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input id="name" name="name" placeholder="Makan, Transport, dll" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyPlanned">Anggaran Bulanan</Label>
              <Input id="monthlyPlanned" name="monthlyPlanned" type="number" required />
            </div>
          </FormDialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead className="text-right">Anggaran Bulanan</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell className="text-right">
                    {formatIDR(Number(c.monthlyPlanned))}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FormDialog
                        title="Edit Kategori"
                        triggerIcon={<Pencil className="size-4" />}
                        triggerVariant="ghost"
                        triggerSize="icon"
                        action={updateBudgetCategory.bind(null, c.id)}
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`name-${c.id}`}>Nama Kategori</Label>
                          <Input
                            id={`name-${c.id}`}
                            name="name"
                            defaultValue={c.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`monthlyPlanned-${c.id}`}>
                            Anggaran Bulanan
                          </Label>
                          <Input
                            id={`monthlyPlanned-${c.id}`}
                            name="monthlyPlanned"
                            type="number"
                            defaultValue={Number(c.monthlyPlanned)}
                            required
                          />
                        </div>
                      </FormDialog>
                      <DeleteButton action={deleteBudgetCategory.bind(null, c.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Belum ada kategori anggaran.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div>
            <CardTitle>Realisasi Bulanan</CardTitle>
            <CardDescription>{format(month, "MMMM yyyy")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              render={<Link href={`?month=${prevMonth}`} />}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-36 text-center text-sm font-medium">
              {format(month, "MMMM yyyy")}
            </span>
            <Button
              variant="outline"
              size="icon"
              nativeButton={false}
              render={<Link href={`?month=${nextMonth}`} />}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Rencana</TableHead>
                <TableHead className="text-right">Ekspektasi</TableHead>
                <TableHead className="text-right">Aktual</TableHead>
                <TableHead className="text-right">Selisih</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {overview.rows.map((row) => {
                const status = budgetStatus(row.actual, row.minTarget, row.maxTarget);
                return (
                  <TableRow key={row.categoryId}>
                    <TableCell>{row.categoryName}</TableCell>
                    <TableCell className="text-right">
                      {formatIDR(row.monthlyPlanned)}
                    </TableCell>
                    {row.entryId === null ? (
                      <>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell className="text-right text-muted-foreground">-</TableCell>
                        <TableCell />
                        <TableCell className="text-center">
                          <FormDialog
                            title={`Isi Realisasi — ${row.categoryName}`}
                            triggerLabel="Isi Realisasi"
                            triggerVariant="outline"
                            action={createBudgetEntry}
                          >
                            <input type="hidden" name="categoryId" value={row.categoryId} />
                            <input
                              type="hidden"
                              name="month"
                              value={overview.month.toISOString()}
                            />
                            <div className="space-y-2">
                              <Label htmlFor="expectation">Ekspektasi</Label>
                              <Input
                                id="expectation"
                                name="expectation"
                                type="number"
                                defaultValue={row.monthlyPlanned}
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="actual">Aktual</Label>
                              <Input id="actual" name="actual" type="number" required />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="minTarget">Target Minimum</Label>
                              <Input
                                id="minTarget"
                                name="minTarget"
                                type="number"
                                placeholder="Opsional"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="maxTarget">Target Maksimum</Label>
                              <Input
                                id="maxTarget"
                                name="maxTarget"
                                type="number"
                                placeholder="Opsional"
                              />
                            </div>
                          </FormDialog>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-right">
                          {formatIDR(row.expectation)}
                        </TableCell>
                        <TableCell className="text-right">{formatIDR(row.actual)}</TableCell>
                        <TableCell
                          className={
                            "text-right " +
                            (row.variance > 0 ? "text-red-600" : "text-green-600")
                          }
                        >
                          {row.variance > 0 ? "+" : ""}
                          {formatIDR(row.variance)}
                        </TableCell>
                        <TableCell>
                          {status && <Badge variant={status.variant}>{status.label}</Badge>}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <FormDialog
                              title={`Edit Realisasi — ${row.categoryName}`}
                              triggerIcon={<Pencil className="size-4" />}
                              triggerVariant="ghost"
                              triggerSize="icon"
                              action={updateBudgetEntry.bind(null, row.entryId)}
                            >
                              <div className="space-y-2">
                                <Label htmlFor={`expectation-${row.entryId}`}>
                                  Ekspektasi
                                </Label>
                                <Input
                                  id={`expectation-${row.entryId}`}
                                  name="expectation"
                                  type="number"
                                  defaultValue={row.expectation}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`actual-${row.entryId}`}>Aktual</Label>
                                <Input
                                  id={`actual-${row.entryId}`}
                                  name="actual"
                                  type="number"
                                  defaultValue={row.actual}
                                  required
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`minTarget-${row.entryId}`}>
                                  Target Minimum
                                </Label>
                                <Input
                                  id={`minTarget-${row.entryId}`}
                                  name="minTarget"
                                  type="number"
                                  defaultValue={row.minTarget ?? ""}
                                  placeholder="Opsional"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor={`maxTarget-${row.entryId}`}>
                                  Target Maksimum
                                </Label>
                                <Input
                                  id={`maxTarget-${row.entryId}`}
                                  name="maxTarget"
                                  type="number"
                                  defaultValue={row.maxTarget ?? ""}
                                  placeholder="Opsional"
                                />
                              </div>
                            </FormDialog>
                            <DeleteButton
                              action={deleteBudgetEntry.bind(null, row.entryId)}
                            />
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                );
              })}
              {overview.rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    Belum ada kategori anggaran untuk ditampilkan.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
