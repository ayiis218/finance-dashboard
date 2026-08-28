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
import { createTransaction, deleteTransaction } from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import { formatDate } from "date-fns";

export default async function TransactionsPage() {
  const [transactions, accounts] = await Promise.all([
    prisma.transaction.findMany({
      include: { account: true },
      orderBy: { date: "desc" },
      take: 100,
    }),
    prisma.bankAccount.findMany(),
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Transaksi</CardTitle>
        <FormDialog
          title="Tambah Transaksi"
          triggerLabel="Tambah"
          action={createTransaction}
        >
          <div className="space-y-2">
            <Label htmlFor="accountId">Rekening</Label>
            <select
              id="accountId"
              name="accountId"
              required
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipe</Label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            >
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" placeholder="Makan, Bensin, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input id="amount" name="amount" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tanggal</Label>
            <Input
              id="date"
              name="date"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Catatan</Label>
            <Input id="note" name="note" placeholder="Opsional" />
          </div>
        </FormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Rekening</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((items) => {
              const category = items?.note
                ? `${items.category} - ${items.note}`
                : items.category;
              return (
                <TableRow key={items.id}>
                  <TableCell>
                    {formatDate(items.date, "dd MMMM yyyy")}
                  </TableCell>
                  <TableCell>{items.account.name}</TableCell>
                  <TableCell>{category}</TableCell>
                  <TableCell
                    className={
                      "text-right " +
                      (items.type === "INCOME" ? "text-green-600" : "text-red-600")
                    }
                  >
                    {items.type === "INCOME" ? "+" : "-"}
                    {formatIDR(Number(items.amount))}
                  </TableCell>
                  <TableCell className="text-center">
                    <DeleteButton action={deleteTransaction.bind(null, items.id)} />
                  </TableCell>
                </TableRow>
              )
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada transaksi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
