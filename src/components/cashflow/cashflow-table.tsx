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
import { Badge } from "@/components/ui/badge";
import { FormDialog } from "@/components/form-dialog";
import { CashflowFormFields } from "@/components/cashflow/cashflow-form-fields";
import {
  MobileCardList,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { setCashflowMonthPlan } from "@/lib/actions/cashflow";
import type { getCashflowYearOverview } from "@/lib/queries/cashflow";
import { formatIDR } from "@/lib/format";

type CashflowRow = Awaited<ReturnType<typeof getCashflowYearOverview>>["rows"][number];

function CashflowRowActions({ row }: Readonly<{ row: CashflowRow }>) {
  const monthLabel = format(row.month, "MMMM yyyy");
  return (
    <FormDialog
      title={`Rencana — ${monthLabel}`}
      triggerIcon={<Pencil className="size-4" />}
      triggerVariant="ghost"
      triggerSize="icon"
      action={setCashflowMonthPlan}
    >
      <CashflowFormFields
        idPrefix={row.month.toISOString()}
        month={row.month.toISOString()}
        monthLabel={monthLabel}
        saldoAwal={row.saldoAwal}
        defaults={{
          expectedDelta: row.expectedDelta,
          saldoAkhirActual: row.isActualOverridden ? row.saldoAkhirActual : null,
        }}
      />
    </FormDialog>
  );
}

export function CashflowTable({ rows }: Readonly<{ rows: CashflowRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bulan</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Rencana Bulanan</TableHead>
              <TableHead className="text-right">Saldo Akhir Ekspektasi</TableHead>
              <TableHead className="text-right">Saldo Akhir Aktual</TableHead>
              <TableHead className="text-right">Selisih</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.month.toISOString()}>
                <TableCell>{format(row.month, "MMMM yyyy")}</TableCell>
                <TableCell className="text-right">{formatIDR(row.saldoAwal)}</TableCell>
                <TableCell
                  className={
                    "text-right " +
                    (row.expectedDelta >= 0 ? "text-positive" : "text-destructive")
                  }
                >
                  {row.expectedDelta > 0 ? "+" : ""}
                  {formatIDR(row.expectedDelta)}
                </TableCell>
                <TableCell className="text-right">{formatIDR(row.saldoAkhirExpected)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {formatIDR(row.saldoAkhirActual)}
                    {row.isActualOverridden && (
                      <Badge variant="outline" className="text-[10px]">
                        manual
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell
                  className={
                    "text-right " + (row.variance >= 0 ? "text-positive" : "text-destructive")
                  }
                >
                  {row.variance > 0 ? "+" : ""}
                  {formatIDR(row.variance)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <CashflowRowActions row={row} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((row) => (
          <MobileRowCard key={row.month.toISOString()}>
            <MobileRowHeader
              title={format(row.month, "MMMM yyyy")}
              action={
                row.isActualOverridden && (
                  <Badge variant="outline" className="text-[10px]">
                    manual
                  </Badge>
                )
              }
            />
            <MobileRowField label="Saldo Awal" value={formatIDR(row.saldoAwal)} />
            <MobileRowField
              label="Rencana Bulanan"
              value={`${row.expectedDelta > 0 ? "+" : ""}${formatIDR(row.expectedDelta)}`}
              valueClassName={row.expectedDelta >= 0 ? "text-positive" : "text-destructive"}
            />
            <MobileRowField
              label="Saldo Akhir Ekspektasi"
              value={formatIDR(row.saldoAkhirExpected)}
            />
            <MobileRowField label="Saldo Akhir Aktual" value={formatIDR(row.saldoAkhirActual)} />
            <MobileRowField
              label="Selisih"
              value={`${row.variance > 0 ? "+" : ""}${formatIDR(row.variance)}`}
              valueClassName={row.variance >= 0 ? "text-positive" : "text-destructive"}
            />
            <MobileRowActions>
              <CashflowRowActions row={row} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
      </MobileCardList>
    </>
  );
}
