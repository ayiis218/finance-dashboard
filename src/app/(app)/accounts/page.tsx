export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { prisma } from "@/lib/prisma";
import { createBankAccount, deleteBankAccount } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function AccountsPage() {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Rekening &amp; Cash</CardTitle>
        <FormDialog
          title="Tambah Rekening"
          triggerLabel="Tambah"
          action={createBankAccount}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" placeholder="BCA, Cash, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Saldo</Label>
            <Input id="balance" name="balance" type="number" defaultValue={0} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pocketChange">Receh</Label>
            <Input id="pocketChange" name="pocketChange" type="number" defaultValue={0} />
          </div>
        </FormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Receh</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.name}</TableCell>
                <TableCell className="text-right">
                  {formatIDR(Number(a.balance))}
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(Number(a.pocketChange))}
                </TableCell>
                <TableCell>
                  <DeleteButton action={deleteBankAccount.bind(null, a.id)} />
                </TableCell>
              </TableRow>
            ))}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Belum ada rekening.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
