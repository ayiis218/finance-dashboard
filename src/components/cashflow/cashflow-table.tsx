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
  variance: number | null;
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
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Starting Balance</TableHead>
              <TableHead className="text-right">Ending Balance (Expected)</TableHead>
              <TableHead className="text-right">Ending Balance (Actual)</TableHead>
              <TableHead className="text-right">Variance</TableHead>
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
                    (f.variance == null
                      ? "text-muted-foreground"
                      : f.variance >= 0
                        ? "text-positive"
                        : "text-destructive")
                  }
                >
                  {f.variance != null ? `${f.variance > 0 ? "+" : ""}${formatIDR(f.variance)}` : "-"}
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
                  No cashflow forecasts yet.
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
            <MobileRowField label="Starting Balance" value={formatIDR(f.saldoAwal)} />
            <MobileRowField
              label="Ending Balance (Expected)"
              value={f.saldoAkhirExpected != null ? formatIDR(f.saldoAkhirExpected) : "-"}
            />
            <MobileRowField
              label="Ending Balance (Actual)"
              value={f.saldoAkhirActual != null ? formatIDR(f.saldoAkhirActual) : "-"}
            />
            <MobileRowField
              label="Variance"
              value={f.variance != null ? `${f.variance > 0 ? "+" : ""}${formatIDR(f.variance)}` : "-"}
              valueClassName={
                f.variance == null
                  ? "text-muted-foreground"
                  : f.variance >= 0
                    ? "text-positive"
                    : "text-destructive"
              }
            />
            <MobileRowActions>
              <CashflowRowActions item={f} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && (
          <MobileEmptyState>No cashflow forecasts yet.</MobileEmptyState>
        )}
      </MobileCardList>
    </>
  );
}
