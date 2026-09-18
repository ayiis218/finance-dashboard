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
    return { label: "Below Target", variant: "destructive" as const };
  }
  if (maxTarget != null && actual > maxTarget) {
    return { label: "Over Target", variant: "destructive" as const };
  }
  if (minTarget == null && maxTarget == null) return null;
  return { label: "On Target", variant: "default" as const };
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
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Planned</TableHead>
              <TableHead className="text-right">Expected</TableHead>
              <TableHead className="text-right">Actual</TableHead>
              <TableHead className="text-right">Variance</TableHead>
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
                          title={`Fill Actuals — ${row.categoryName}`}
                          triggerLabel="Fill Actuals"
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
                          "text-right " + (row.variance > 0 ? "text-destructive" : "text-positive")
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
                            title={`Edit Actuals — ${row.categoryName}`}
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
                  No budget categories to display.
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
              <MobileRowField label="Planned" value={formatIDR(row.monthlyPlanned)} />
              {row.entryId === null ? (
                <MobileRowActions>
                  <FormDialog
                    title={`Fill Actuals — ${row.categoryName}`}
                    triggerLabel="Fill Actuals"
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
                  <MobileRowField label="Expected" value={formatIDR(row.expectation)} />
                  <MobileRowField label="Actual" value={formatIDR(row.actual)} />
                  <MobileRowField
                    label="Variance"
                    value={`${row.variance > 0 ? "+" : ""}${formatIDR(row.variance)}`}
                    valueClassName={row.variance > 0 ? "text-destructive" : "text-positive"}
                  />
                  <MobileRowActions>
                    <FormDialog
                      title={`Edit Actuals — ${row.categoryName}`}
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
          <MobileEmptyState>No budget categories to display.</MobileEmptyState>
        )}
      </MobileCardList>
    </>
  );
}
