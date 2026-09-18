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
import { updateBankAccount, deleteBankAccount } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

type AccountRow = { id: string; name: string; balance: unknown };

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
            {rows.map((items, index) => (
              <TableRow key={items.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{items.name}</TableCell>
                <TableCell className="text-right">{formatIDR(Number(items.balance))}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <AccountRowActions item={items} />
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
        {rows.map((items) => (
          <MobileRowCard key={items.id}>
            <MobileRowHeader title={items.name} />
            <p className="text-lg font-semibold">{formatIDR(Number(items.balance))}</p>
            <MobileRowActions>
              <AccountRowActions item={items} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && <MobileEmptyState>No accounts yet.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
