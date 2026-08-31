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
import { Pencil } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SummaryStats } from "@/components/summary-stats";
import { prisma } from "@/lib/prisma";
import { createBankAccount, deleteBankAccount, updateBankAccount } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function AccountsPage() {
  const accounts = await prisma.bankAccount.findMany({
    orderBy: { name: "asc" },
  });

  const totalSaldo = accounts.reduce((sum, a) => sum + Number(a.balance), 0);
  const totalReceh = accounts.reduce((sum, a) => sum + Number(a.pocketChange), 0);

  const summaryItems = [
    { label: "Total Saldo", value: formatIDR(totalSaldo) },
    { label: "Total Receh", value: formatIDR(totalReceh) },
    { label: "Grand Total", value: formatIDR(totalSaldo + totalReceh), tone: "highlight" as const },
    { label: "Jumlah Rekening", value: String(accounts.length) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
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
          <TableHeader className="bg-muted rounded-t-lg">
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Receh</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((items) => (
              <TableRow key={items.id}>
                <TableCell>{items.name}</TableCell>
                <TableCell className="text-right">
                  {formatIDR(Number(items.balance))}
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(Number(items.pocketChange))}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FormDialog
                      title="Edit Rekening"
                      triggerIcon={<Pencil className="size-4" />}
                      triggerVariant="ghost"
                      triggerSize="icon"
                      action={updateBankAccount.bind(null, items.id)}
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`name-${items.id}`}>Nama</Label>
                        <Input
                          id={`name-${items.id}`}
                          name="name"
                          defaultValue={items.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`balance-${items.id}`}>Saldo</Label>
                        <Input
                          id={`balance-${items.id}`}
                          name="balance"
                          type="number"
                          defaultValue={Number(items.balance)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`pocketChange-${items.id}`}>Receh</Label>
                        <Input
                          id={`pocketChange-${items.id}`}
                          name="pocketChange"
                          type="number"
                          defaultValue={Number(items.pocketChange)}
                        />
                      </div>
                    </FormDialog>
                    <DeleteButton action={deleteBankAccount.bind(null, items.id)} />
                  </div>
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
    </div>
  );
}
