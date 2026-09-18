import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { BudgetCategoryFormFields } from "@/components/budget/budget-category-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateBudgetCategory, deleteBudgetCategory } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

type BudgetCategoryRow = { id: string; name: string; monthlyPlanned: unknown };

function BudgetCategoryRowActions({ item }: Readonly<{ item: BudgetCategoryRow }>) {
  return (
    <>
      <FormDialog
        title="Edit Category"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateBudgetCategory.bind(null, item.id)}
      >
        <BudgetCategoryFormFields
          idPrefix={item.id}
          defaults={{ name: item.name, monthlyPlanned: Number(item.monthlyPlanned) }}
        />
      </FormDialog>
      <DeleteButton action={deleteBudgetCategory.bind(null, item.id)} />
    </>
  );
}

export function BudgetCategoryTable({ rows }: Readonly<{ rows: BudgetCategoryRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Monthly Budget</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((c, index) => (
              <TableRow key={c.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className="text-right">{formatIDR(Number(c.monthlyPlanned))}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <BudgetCategoryRowActions item={c} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No budget categories yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((c) => (
          <MobileRowCard key={c.id}>
            <MobileRowHeader title={c.name} />
            <p className="text-lg font-semibold">{formatIDR(Number(c.monthlyPlanned))}</p>
            <MobileRowActions>
              <BudgetCategoryRowActions item={c} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && <MobileEmptyState>No budget categories yet.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
