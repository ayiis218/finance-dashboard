export const dynamic = "force-dynamic";

import Link from "next/link";
import { addMonths, format, parse, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, Pencil, Upload } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SummaryStats } from "@/components/summary-stats";
import { prisma } from "@/lib/prisma";
import {
  getDistinctCategories,
  getLatestTransaction,
  getTransactionsForMonth,
} from "@/lib/queries";
import { createTransaction, deleteTransaction, updateTransaction } from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import { formatDate } from "date-fns";

export default async function TransactionsPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ month?: string }> }>) {
  const { month: monthParam } = await searchParams;
  const month = monthParam ? parse(monthParam, "yyyy-MM", new Date()) : new Date();

  const [transactions, accounts, categories, latestTransaction] = await Promise.all([
    getTransactionsForMonth(month),
    prisma.bankAccount.findMany(),
    getDistinctCategories(),
    getLatestTransaction(),
  ]);

  const prevMonth = format(subMonths(month, 1), "yyyy-MM");
  const nextMonth = format(addMonths(month, 1), "yyyy-MM");

  const monthlyIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const summaryItems = [
    { label: "Pemasukan Bulan Ini", value: formatIDR(monthlyIncome), tone: "positive" as const },
    { label: "Pengeluaran Bulan Ini", value: formatIDR(monthlyExpense), tone: "negative" as const },
    {
      label: "Selisih Bulan Ini",
      value: formatIDR(monthlyIncome - monthlyExpense),
      tone: "highlight" as const,
    },
    latestTransaction
      ? {
          label: "Transaksi Terakhir",
          value: formatIDR(Number(latestTransaction.amount)),
          sublabel: `${latestTransaction.category} · ${formatDate(latestTransaction.date, "dd MMM yyyy")}`,
        }
      : { label: "Transaksi Terakhir", value: "-", sublabel: "Belum ada transaksi" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle>Transaksi</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/transactions/import" />}>
            <Upload className="size-4" />
            Import CSV
          </Button>
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
              {accounts.map((items) => (
                <option key={items.id} value={items.id}>
                  {items.name}
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
            <Input
              id="category"
              name="category"
              list="category-suggestions"
              placeholder="Makan, Bensin, dll"
              required
            />
            <datalist id="category-suggestions">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
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
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name="affectsBalance" defaultChecked />
              Transaksi ini mengubah saldo rekening
            </label>
            <p className="pl-6 text-xs text-muted-foreground">
              Aktif = saldo rekening otomatis bertambah/berkurang sesuai jumlah di atas. Matikan
              kalau ini cuma catatan historis dan saldo rekening tidak boleh berubah.
            </p>
          </div>
          </FormDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-center gap-3">
          <Button variant="outline" size="icon" render={<Link href={`?month=${prevMonth}`} />}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="min-w-36 text-center text-sm font-medium">
            {format(month, "MMMM yyyy")}
          </span>
          <Button variant="outline" size="icon" render={<Link href={`?month=${nextMonth}`} />}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tanggal</TableHead>
              <TableHead>Rekening</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead className="text-center">Status</TableHead>
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
                    <Badge variant={items.affectsBalance ? "secondary" : "outline"}>
                      {items.affectsBalance ? "Baru" : "Histori"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FormDialog
                        title="Edit Transaksi"
                        triggerIcon={<Pencil className="size-4 text-blue-500" />}
                        triggerVariant="ghost"
                        triggerSize="icon"
                        action={updateTransaction.bind(null, items.id)}
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`accountId-${items.id}`}>Rekening</Label>
                          <select
                            id={`accountId-${items.id}`}
                            name="accountId"
                            defaultValue={items.accountId}
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
                          <Label htmlFor={`type-${items.id}`}>Tipe</Label>
                          <select
                            id={`type-${items.id}`}
                            name="type"
                            defaultValue={items.type}
                            required
                            className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                          >
                            <option value="EXPENSE">Pengeluaran</option>
                            <option value="INCOME">Pemasukan</option>
                            <option value="TRANSFER">Transfer</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`category-${items.id}`}>Kategori</Label>
                          <Input
                            id={`category-${items.id}`}
                            name="category"
                            list="category-suggestions"
                            defaultValue={items.category}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`amount-${items.id}`}>Jumlah</Label>
                          <Input
                            id={`amount-${items.id}`}
                            name="amount"
                            type="number"
                            defaultValue={Number(items.amount)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`date-${items.id}`}>Tanggal</Label>
                          <Input
                            id={`date-${items.id}`}
                            name="date"
                            type="date"
                            defaultValue={format(items.date, "yyyy-MM-dd")}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`note-${items.id}`}>Catatan</Label>
                          <Input
                            id={`note-${items.id}`}
                            name="note"
                            defaultValue={items.note ?? ""}
                            placeholder="Opsional"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="flex items-center gap-2 text-sm">
                            <Checkbox
                              name="affectsBalance"
                              defaultChecked={items.affectsBalance}
                            />
                            Transaksi ini mengubah saldo rekening
                          </label>
                          <p className="pl-6 text-xs text-muted-foreground">
                            Aktif = saldo rekening otomatis bertambah/berkurang sesuai jumlah di
                            atas. Matikan kalau ini cuma catatan historis dan saldo rekening tidak
                            boleh berubah.
                          </p>
                        </div>
                      </FormDialog>
                      <DeleteButton action={deleteTransaction.bind(null, items.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Tidak ada transaksi di bulan ini.
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
