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
import { AccountFormFields } from "@/components/accounts/account-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateBankAccount, deleteBankAccount } from "@/lib/actions/accounts";
import type { getBankAccounts } from "@/lib/queries/accounts";
import { formatIDR } from "@/lib/format";

type AccountRow = Awaited<ReturnType<typeof getBankAccounts>>[number];

function AccountRowActions({ item }: Readonly<{ item: AccountRow }>) {
  return (
    <>
      <FormDialog
        title="Edit Account"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateBankAccount.bind(null, item.id)}
      >
        <AccountFormFields
          idPrefix={item.id}
          defaults={{ name: item.name, balance: Number(item.balance) }}
        />
      </FormDialog>
      <DeleteButton action={deleteBankAccount.bind(null, item.id)} />
    </>
  );
}

export function AccountTable({ rows }: Readonly<{ rows: AccountRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader className="bg-muted rounded-t-lg">
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((account, index) => (
              <TableRow key={account.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{account.name}</TableCell>
                <TableCell className="text-right">{formatIDR(Number(account.balance))}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <AccountRowActions item={account} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No accounts yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((account) => (
          <MobileRowCard key={account.id}>
            <MobileRowHeader title={account.name} />
            <p className="text-lg font-semibold">{formatIDR(Number(account.balance))}</p>
            <MobileRowActions>
              <AccountRowActions item={account} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && <MobileEmptyState>No accounts yet.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
