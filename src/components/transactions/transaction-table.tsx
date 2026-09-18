import { formatDate } from "date-fns";
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
import { TransactionFormFields } from "@/components/transactions/transaction-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateTransaction, deleteTransaction } from "@/lib/actions/transactions";
import type { getTransactionsFiltered } from "@/lib/queries/transactions";
import { formatIDR } from "@/lib/format";

type Account = { id: string; name: string };

type TransactionRow = Awaited<
  ReturnType<typeof getTransactionsFiltered>
>["transactions"][number];

function TransactionRowActions({
  item,
  accounts,
  categories,
}: Readonly<{ item: TransactionRow; accounts: Account[]; categories: string[] }>) {
  return (
    <>
      <FormDialog
        title="Edit Transaction"
        triggerIcon={<Pencil className="size-4 text-primary" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateTransaction.bind(null, item.id)}
      >
        <TransactionFormFields
          idPrefix={item.id}
          accounts={accounts}
          categories={categories}
          defaults={{
            accountId: item.accountId,
            toAccountId: item.toAccountId,
            type: item.type,
            category: item.category,
            amount: Number(item.amount),
            date: formatDate(item.date, "yyyy-MM-dd"),
            note: item.note,
            affectsBalance: item.affectsBalance,
          }}
        />
      </FormDialog>
      <DeleteButton action={deleteTransaction.bind(null, item.id)} />
    </>
  );
}

export function TransactionTable({
  rows,
  page,
  pageSize,
  accounts,
  categories,
}: Readonly<{
  rows: TransactionRow[];
  page: number;
  pageSize: number;
  accounts: Account[];
  categories: string[];
}>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((transaction, index) => {
              const category = transaction.note
                ? `${transaction.category} - ${transaction.note}`
                : transaction.category;
              return (
                <TableRow key={transaction.id}>
                  <TableCell className="text-muted-foreground">
                    {(page - 1) * pageSize + index + 1}
                  </TableCell>
                  <TableCell>{formatDate(transaction.date, "dd MMMM yyyy")}</TableCell>
                  <TableCell>
                    {transaction.account.name}
                    {transaction.toAccount && (
                      <span className="text-muted-foreground"> → {transaction.toAccount.name}</span>
                    )}
                  </TableCell>
                  <TableCell>{category}</TableCell>
                  <TableCell
                    className={
                      "text-right " +
                      (transaction.type === "INCOME" ? "text-positive" : "text-destructive")
                    }
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}
                    {formatIDR(Number(transaction.amount))}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={transaction.affectsBalance ? "secondary" : "outline"}>
                      {transaction.affectsBalance ? "New" : "History"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <TransactionRowActions
                        item={transaction}
                        accounts={accounts}
                        categories={categories}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((transaction) => {
          const category = transaction.note
            ? `${transaction.category} - ${transaction.note}`
            : transaction.category;
          return (
            <MobileRowCard key={transaction.id}>
              <MobileRowHeader
                title={formatDate(transaction.date, "dd MMM yyyy")}
                action={
                  <Badge variant={transaction.affectsBalance ? "secondary" : "outline"}>
                    {transaction.affectsBalance ? "New" : "History"}
                  </Badge>
                }
              />
              <MobileRowField
                label="Account"
                value={
                  <>
                    {transaction.account.name}
                    {transaction.toAccount && (
                      <span className="text-muted-foreground"> → {transaction.toAccount.name}</span>
                    )}
                  </>
                }
              />
              <MobileRowField label="Category" value={category} />
              <p
                className={
                  "text-lg font-semibold " +
                  (transaction.type === "INCOME" ? "text-positive" : "text-destructive")
                }
              >
                {transaction.type === "INCOME" ? "+" : "-"}
                {formatIDR(Number(transaction.amount))}
              </p>
              <MobileRowActions>
                <TransactionRowActions
                  item={transaction}
                  accounts={accounts}
                  categories={categories}
                />
              </MobileRowActions>
            </MobileRowCard>
          );
        })}
        {rows.length === 0 && <MobileEmptyState>No transactions found.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
