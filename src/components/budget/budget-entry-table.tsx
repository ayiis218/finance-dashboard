import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { BudgetEntryFormFields } from "@/components/budget/budget-entry-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { createBudgetEntry, updateBudgetEntry, deleteBudgetEntry } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

function budgetStatus(actual: number, minTarget: number | null, maxTarget: number | null) {
  if (minTarget != null && actual < minTarget) {
    return { label: "Di Bawah Target", variant: "destructive" as const };
  }
  if (maxTarget != null && actual > maxTarget) {
    return { label: "Melebihi Target", variant: "destructive" as const };
  }
  if (minTarget == null && maxTarget == null) return null;
  return { label: "Sesuai Target", variant: "default" as const };
}

type BudgetOverviewRow = {
  categoryId: string;
  categoryName: string;
  monthlyPlanned: number;
  entryId: string | null;
  actual: number;
  expectation: number;
  variance: number;
  minTarget: number | null;
  maxTarget: number | null;
};

export function BudgetEntryTable({
  rows,
  monthIso,
}: Readonly<{ rows: BudgetOverviewRow[]; monthIso: string }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
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
            {rows.map((row, index) => {
              const status = budgetStatus(row.actual, row.minTarget, row.maxTarget);
              return (
                <TableRow key={row.categoryId}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>{row.categoryName}</TableCell>
                  <TableCell className="text-right">{formatIDR(row.monthlyPlanned)}</TableCell>
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
                          <BudgetEntryFormFields
                            idPrefix="new"
                            hiddenCategoryId={row.categoryId}
                            hiddenMonth={monthIso}
                            defaults={{ expectation: row.monthlyPlanned }}
                          />
                        </FormDialog>
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-right">{formatIDR(row.expectation)}</TableCell>
                      <TableCell className="text-right">{formatIDR(row.actual)}</TableCell>
                      <TableCell
                        className={
                          "text-right " + (row.variance > 0 ? "text-red-600" : "text-green-600")
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
                            <BudgetEntryFormFields
                              idPrefix={row.entryId}
                              defaults={{
                                expectation: row.expectation,
                                actual: row.actual,
                                minTarget: row.minTarget,
                                maxTarget: row.maxTarget,
                              }}
                            />
                          </FormDialog>
                          <DeleteButton action={deleteBudgetEntry.bind(null, row.entryId)} />
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Belum ada kategori anggaran untuk ditampilkan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((row) => {
          const status = budgetStatus(row.actual, row.minTarget, row.maxTarget);
          return (
            <MobileRowCard key={row.categoryId}>
              <MobileRowHeader
                title={row.categoryName}
                action={status && <Badge variant={status.variant}>{status.label}</Badge>}
              />
              <MobileRowField label="Rencana" value={formatIDR(row.monthlyPlanned)} />
              {row.entryId === null ? (
                <MobileRowActions>
                  <FormDialog
                    title={`Isi Realisasi — ${row.categoryName}`}
                    triggerLabel="Isi Realisasi"
                    triggerVariant="outline"
                    action={createBudgetEntry}
                  >
                    <BudgetEntryFormFields
                      idPrefix="new"
                      hiddenCategoryId={row.categoryId}
                      hiddenMonth={monthIso}
                      defaults={{ expectation: row.monthlyPlanned }}
                    />
                  </FormDialog>
                </MobileRowActions>
              ) : (
                <>
                  <MobileRowField label="Ekspektasi" value={formatIDR(row.expectation)} />
                  <MobileRowField label="Aktual" value={formatIDR(row.actual)} />
                  <MobileRowField
                    label="Selisih"
                    value={`${row.variance > 0 ? "+" : ""}${formatIDR(row.variance)}`}
                    valueClassName={row.variance > 0 ? "text-red-600" : "text-green-600"}
                  />
                  <MobileRowActions>
                    <FormDialog
                      title={`Edit Realisasi — ${row.categoryName}`}
                      triggerIcon={<Pencil className="size-4" />}
                      triggerVariant="ghost"
                      triggerSize="icon"
                      action={updateBudgetEntry.bind(null, row.entryId)}
                    >
                      <BudgetEntryFormFields
                        idPrefix={row.entryId}
                        defaults={{
                          expectation: row.expectation,
                          actual: row.actual,
                          minTarget: row.minTarget,
                          maxTarget: row.maxTarget,
                        }}
                      />
                    </FormDialog>
                    <DeleteButton action={deleteBudgetEntry.bind(null, row.entryId)} />
                  </MobileRowActions>
                </>
              )}
            </MobileRowCard>
          );
        })}
        {rows.length === 0 && (
          <MobileEmptyState>Belum ada kategori anggaran untuk ditampilkan.</MobileEmptyState>
        )}
      </MobileCardList>
    </>
  );
}
