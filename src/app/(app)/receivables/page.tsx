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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SettleToggle } from "@/components/settle-toggle";
import { prisma } from "@/lib/prisma";
import {
  createReceivable,
  deleteReceivable,
  toggleReceivableSettled,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function ReceivablesPage() {
  const receivables = await prisma.receivable.findMany({
    orderBy: [{ isSettled: "asc" }, { date: "desc" }],
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Piutang &amp; Utang</CardTitle>
        <FormDialog
          title="Tambah Piutang/Utang"
          triggerLabel="Tambah"
          action={createReceivable}
        >
          <div className="space-y-2">
            <Label htmlFor="personName">Nama Orang</Label>
            <Input id="personName" name="personName" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipe</Label>
            <select
              id="type"
              name="type"
              required
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            >
              <option value="PIUTANG">Piutang (dia berhutang ke saya)</option>
              <option value="UTANG">Utang (saya berhutang ke dia)</option>
            </select>
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
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Lunas</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivables.map((r) => (
              <TableRow key={r.id} className={r.isSettled ? "opacity-50" : ""}>
                <TableCell>{r.personName}</TableCell>
                <TableCell>
                  <Badge variant={r.type === "PIUTANG" ? "default" : "destructive"}>
                    {r.type === "PIUTANG" ? "Piutang" : "Utang"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatIDR(Number(r.amount))}
                </TableCell>
                <TableCell>
                  <SettleToggle
                    checked={r.isSettled}
                    action={toggleReceivableSettled.bind(null, r.id)}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <DeleteButton action={deleteReceivable.bind(null, r.id)} />
                </TableCell>
              </TableRow>
            ))}
            {receivables.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada catatan piutang/utang.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
