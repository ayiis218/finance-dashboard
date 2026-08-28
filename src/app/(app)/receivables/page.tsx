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
import { Pencil } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { RepaymentDialog } from "@/components/repayment-dialog";
import { MarkSettledButton } from "@/components/mark-settled-button";
import { getReceivablesWithStatus } from "@/lib/queries";
import {
  createReceivable,
  createRepaymentEntry,
  deleteReceivable,
  deleteRepaymentEntry,
  toggleReceivableSettled,
  updateReceivable,
} from "@/lib/actions";
import { formatDate } from "date-fns";
import { formatIDR } from "@/lib/format";

const STATUS_LABEL = {
  BELUM_LUNAS: "Belum Lunas",
  CICILAN_BERJALAN: "Cicilan Berjalan",
  LUNAS: "Lunas",
} as const;

const STATUS_VARIANT = {
  BELUM_LUNAS: "destructive",
  CICILAN_BERJALAN: "secondary",
  LUNAS: "default",
} as const;

export default async function ReceivablesPage() {
  const receivables = await getReceivablesWithStatus();

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
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Cicilan</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receivables.map((r) => (
              <TableRow key={r.id} className={r.status === "LUNAS" ? "opacity-50" : ""}>
                <TableCell>{r.personName}</TableCell>
                <TableCell>
                  <Badge variant={r.type === "PIUTANG" ? "default" : "destructive"}>
                    {r.type === "PIUTANG" ? "Piutang" : "Utang"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span>{formatIDR(Number(r.amount))}</span>
                    {r.totalPaid > 0 && r.status !== "LUNAS" && (
                      <span className="text-xs text-muted-foreground">
                        terbayar {formatIDR(r.totalPaid)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={STATUS_VARIANT[r.status]}>
                      {STATUS_LABEL[r.status]}
                    </Badge>
                    {r.status !== "LUNAS" && (
                      <MarkSettledButton
                        action={toggleReceivableSettled.bind(null, r.id, true)}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <RepaymentDialog
                    receivableId={r.id}
                    payments={r.payments.map((p) => ({
                      id: p.id,
                      date: p.date,
                      amount: Number(p.amount),
                      note: p.note,
                    }))}
                    remaining={r.remaining}
                    createAction={createRepaymentEntry}
                    deleteAction={deleteRepaymentEntry}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FormDialog
                      title="Edit Piutang/Utang"
                      triggerIcon={<Pencil className="size-4" />}
                      triggerVariant="ghost"
                      triggerSize="icon"
                      action={updateReceivable.bind(null, r.id)}
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`personName-${r.id}`}>Nama Orang</Label>
                        <Input
                          id={`personName-${r.id}`}
                          name="personName"
                          defaultValue={r.personName}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`type-${r.id}`}>Tipe</Label>
                        <select
                          id={`type-${r.id}`}
                          name="type"
                          defaultValue={r.type}
                          required
                          className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
                        >
                          <option value="PIUTANG">Piutang (dia berhutang ke saya)</option>
                          <option value="UTANG">Utang (saya berhutang ke dia)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`amount-${r.id}`}>Jumlah</Label>
                        <Input
                          id={`amount-${r.id}`}
                          name="amount"
                          type="number"
                          defaultValue={Number(r.amount)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`date-${r.id}`}>Tanggal</Label>
                        <Input
                          id={`date-${r.id}`}
                          name="date"
                          type="date"
                          defaultValue={formatDate(r.date, "yyyy-MM-dd")}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`note-${r.id}`}>Catatan</Label>
                        <Input
                          id={`note-${r.id}`}
                          name="note"
                          defaultValue={r.note ?? ""}
                          placeholder="Opsional"
                        />
                      </div>
                    </FormDialog>
                    <DeleteButton action={deleteReceivable.bind(null, r.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {receivables.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
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
