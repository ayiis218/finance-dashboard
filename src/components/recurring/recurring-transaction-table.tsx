"use client";

import { useTransition } from "react";
import { Pencil, Pause, Play } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import {
  RecurringTransactionFormFields,
} from "@/components/recurring/recurring-transaction-form-fields";
import {
  updateRecurringTransaction,
  deleteRecurringTransaction,
  setRecurringTransactionActive,
} from "@/lib/actions/recurring-transactions";
import type { getRecurringTransactions } from "@/lib/queries/recurring-transactions";
import { formatIDR } from "@/lib/format";

type Account = { id: string; name: string };
type RecurringRow = Awaited<ReturnType<typeof getRecurringTransactions>>[number];

function RecurringRowActions({
  item,
  accounts,
  categories,
}: Readonly<{ item: RecurringRow; accounts: Account[]; categories: string[] }>) {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await setRecurringTransactionActive(item.id, !item.active);
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Failed to update");
            }
          })
        }
        title={item.active ? "Pause" : "Resume"}
      >
        {item.active ? <Pause className="size-4" /> : <Play className="size-4" />}
      </Button>
      <FormDialog
        title="Edit Recurring Transaction"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateRecurringTransaction.bind(null, item.id)}
      >
        <RecurringTransactionFormFields
          idPrefix={item.id}
          accounts={accounts}
          categories={categories}
          defaults={{
            accountId: item.accountId,
            toAccountId: item.toAccountId,
            type: item.type,
            category: item.category,
            amount: Number(item.amount),
            note: item.note,
            affectsBalance: item.affectsBalance,
            frequency: item.frequency,
            startDate: item.startDate.toISOString().slice(0, 10),
            endDate: item.endDate?.toISOString().slice(0, 10),
          }}
        />
      </FormDialog>
      <DeleteButton action={deleteRecurringTransaction.bind(null, item.id)} />
    </>
  );
}

export function RecurringTransactionTable({
  rows,
  accounts,
  categories,
}: Readonly<{ rows: RecurringRow[]; accounts: Account[]; categories: string[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.account.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{r.frequency}</Badge>
                </TableCell>
                <TableCell>{format(r.nextRunDate, "d MMM yyyy")}</TableCell>
                <TableCell
                  className={
                    "text-right " + (r.type === "INCOME" ? "text-positive" : "text-destructive")
                  }
                >
                  {r.type === "INCOME" ? "+" : "-"}
                  {formatIDR(Number(r.amount))}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <RecurringRowActions item={r} accounts={accounts} categories={categories} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No recurring transactions yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((r) => (
          <MobileRowCard key={r.id}>
            <MobileRowHeader title={r.category} />
            <MobileRowField label="Account" value={r.account.name} />
            <MobileRowField label="Frequency" value={<Badge variant="outline">{r.frequency}</Badge>} />
            <MobileRowField label="Next Run" value={format(r.nextRunDate, "d MMM yyyy")} />
            <MobileRowField
              label="Amount"
              value={`${r.type === "INCOME" ? "+" : "-"}${formatIDR(Number(r.amount))}`}
              valueClassName={r.type === "INCOME" ? "text-positive" : "text-destructive"}
            />
            <MobileRowActions>
              <RecurringRowActions item={r} accounts={accounts} categories={categories} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && <MobileEmptyState>No recurring transactions yet.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
