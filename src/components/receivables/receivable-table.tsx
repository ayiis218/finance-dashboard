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
import { RepaymentDialog } from "@/components/receivables/repayment-dialog";
import { MarkSettledButton } from "@/components/receivables/mark-settled-button";
import { ReceivableFormFields } from "@/components/receivables/receivable-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import {
  createRepaymentEntry,
  deleteReceivable,
  deleteRepaymentEntry,
  toggleReceivableSettled,
  updateReceivable,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import type { ReceivableStatus } from "@/lib/queries";

const STATUS_LABEL = {
  UNPAID: "Belum Lunas",
  PARTIALLY_PAID: "Cicilan Berjalan",
  SETTLED: "Lunas",
} as const;

const STATUS_VARIANT = {
  UNPAID: "destructive",
  PARTIALLY_PAID: "secondary",
  SETTLED: "default",
} as const;

type ReceivableRow = {
  id: string;
  personName: string;
  type: "PIUTANG" | "UTANG";
  amount: unknown;
  date: Date;
  note: string | null;
  totalPaid: number;
  remaining: number;
  status: ReceivableStatus;
  payments: { id: string; date: Date; amount: unknown; note: string | null }[];
};

function ReceivableRepayment({ item }: Readonly<{ item: ReceivableRow }>) {
  return (
    <RepaymentDialog
      receivableId={item.id}
      payments={item.payments.map((p) => ({
        id: p.id,
        date: p.date,
        amount: Number(p.amount),
        note: p.note,
      }))}
      remaining={item.remaining}
      createAction={createRepaymentEntry}
      deleteAction={deleteRepaymentEntry}
    />
  );
}

function ReceivableRowActions({ item }: Readonly<{ item: ReceivableRow }>) {
  return (
    <>
      <FormDialog
        title="Edit Piutang/Utang"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateReceivable.bind(null, item.id)}
      >
        <ReceivableFormFields
          idPrefix={item.id}
          defaults={{
            personName: item.personName,
            type: item.type,
            amount: Number(item.amount),
            date: formatDate(item.date, "yyyy-MM-dd"),
            note: item.note,
          }}
        />
      </FormDialog>
      <DeleteButton action={deleteReceivable.bind(null, item.id)} />
    </>
  );
}

export function ReceivableTable({ rows }: Readonly<{ rows: ReceivableRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead className="text-right">Jumlah</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Cicilan</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r, index) => (
              <TableRow key={r.id} className={r.status === "SETTLED" ? "opacity-50" : ""}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{r.personName}</TableCell>
                <TableCell>
                  <Badge variant={r.type === "PIUTANG" ? "default" : "destructive"}>
                    {r.type === "PIUTANG" ? "Piutang" : "Utang"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span>{formatIDR(Number(r.amount))}</span>
                    {r.totalPaid > 0 && r.status !== "SETTLED" && (
                      <span className="text-xs text-muted-foreground">
                        terbayar {formatIDR(r.totalPaid)}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                    {r.status !== "SETTLED" && (
                      <MarkSettledButton action={toggleReceivableSettled.bind(null, r.id, true)} />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <ReceivableRepayment item={r} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <ReceivableRowActions item={r} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada catatan piutang/utang.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((r) => (
          <MobileRowCard key={r.id} className={r.status === "SETTLED" ? "opacity-50" : ""}>
            <MobileRowHeader
              title={r.personName}
              action={
                <Badge variant={r.type === "PIUTANG" ? "default" : "destructive"}>
                  {r.type === "PIUTANG" ? "Piutang" : "Utang"}
                </Badge>
              }
            />
            <MobileRowField
              label="Jumlah"
              value={
                <div className="flex flex-col items-end">
                  <span>{formatIDR(Number(r.amount))}</span>
                  {r.totalPaid > 0 && r.status !== "SETTLED" && (
                    <span className="text-xs text-muted-foreground">
                      terbayar {formatIDR(r.totalPaid)}
                    </span>
                  )}
                </div>
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status]}</Badge>
              {r.status !== "SETTLED" && (
                <MarkSettledButton action={toggleReceivableSettled.bind(null, r.id, true)} />
              )}
            </div>
            <ReceivableRepayment item={r} />
            <MobileRowActions>
              <ReceivableRowActions item={r} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && (
          <MobileEmptyState>Belum ada catatan piutang/utang.</MobileEmptyState>
        )}
      </MobileCardList>
    </>
  );
}
