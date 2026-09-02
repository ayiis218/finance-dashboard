import { format } from "date-fns";
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
import { CashflowFormFields } from "@/components/cashflow/cashflow-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateCashflowForecast, deleteCashflowForecast } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

type CashflowRow = {
  id: string;
  month: Date;
  saldoAwal: number;
  saldoAkhirExpected: number | null;
  saldoAkhirActual: number | null;
  selisih: number | null;
};

function CashflowRowActions({ item }: Readonly<{ item: CashflowRow }>) {
  return (
    <>
      <FormDialog
        title={`Edit Forecast — ${format(item.month, "MMMM yyyy")}`}
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateCashflowForecast.bind(null, item.id)}
      >
        <CashflowFormFields
          idPrefix={item.id}
          monthLabel={format(item.month, "MMMM yyyy")}
          defaults={{
            saldoAwal: item.saldoAwal,
            saldoAkhirExpected: item.saldoAkhirExpected,
            saldoAkhirActual: item.saldoAkhirActual,
          }}
        />
      </FormDialog>
      <DeleteButton action={deleteCashflowForecast.bind(null, item.id)} />
    </>
  );
}

export function CashflowTable({ rows }: Readonly<{ rows: CashflowRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Bulan</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Saldo Akhir (Ekspektasi)</TableHead>
              <TableHead className="text-right">Saldo Akhir (Aktual)</TableHead>
              <TableHead className="text-right">Selisih</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((f, index) => (
              <TableRow key={f.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{format(f.month, "MMMM yyyy")}</TableCell>
                <TableCell className="text-right">{formatIDR(f.saldoAwal)}</TableCell>
                <TableCell className="text-right">
                  {f.saldoAkhirExpected != null ? formatIDR(f.saldoAkhirExpected) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  {f.saldoAkhirActual != null ? formatIDR(f.saldoAkhirActual) : "-"}
                </TableCell>
                <TableCell
                  className={
                    "text-right " +
                    (f.selisih == null
                      ? "text-muted-foreground"
                      : f.selisih >= 0
                        ? "text-green-600"
                        : "text-red-600")
                  }
                >
                  {f.selisih != null ? `${f.selisih > 0 ? "+" : ""}${formatIDR(f.selisih)}` : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CashflowRowActions item={f} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada catatan cashflow forecast.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((f) => (
          <MobileRowCard key={f.id}>
            <MobileRowHeader title={format(f.month, "MMMM yyyy")} />
            <MobileRowField label="Saldo Awal" value={formatIDR(f.saldoAwal)} />
            <MobileRowField
              label="Saldo Akhir (Ekspektasi)"
              value={f.saldoAkhirExpected != null ? formatIDR(f.saldoAkhirExpected) : "-"}
            />
            <MobileRowField
              label="Saldo Akhir (Aktual)"
              value={f.saldoAkhirActual != null ? formatIDR(f.saldoAkhirActual) : "-"}
            />
            <MobileRowField
              label="Selisih"
              value={f.selisih != null ? `${f.selisih > 0 ? "+" : ""}${formatIDR(f.selisih)}` : "-"}
              valueClassName={
                f.selisih == null
                  ? "text-muted-foreground"
                  : f.selisih >= 0
                    ? "text-green-600"
                    : "text-red-600"
              }
            />
            <MobileRowActions>
              <CashflowRowActions item={f} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && (
          <MobileEmptyState>Belum ada catatan cashflow forecast.</MobileEmptyState>
        )}
      </MobileCardList>
    </>
  );
}
