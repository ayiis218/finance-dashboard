import Link from "next/link";
import { format } from "date-fns";
import { Pencil, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
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
import { setCashflowMonth } from "@/lib/actions/cashflow";
import type { getCashflowYearOverview } from "@/lib/queries/cashflow";
import { formatIDR } from "@/lib/format";

type CashflowRow = Awaited<ReturnType<typeof getCashflowYearOverview>>["rows"][number];

function CashflowRowActions({ row }: Readonly<{ row: CashflowRow }>) {
  const monthSlug = format(row.month, "yyyy-MM");
  const monthLabel = format(row.month, "MMMM yyyy");
  return (
    <div className="flex items-center justify-center gap-1">
      <FormDialog
        title={`Balance — ${monthLabel}`}
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={setCashflowMonth}
      >
        <CashflowFormFields
          idPrefix={monthSlug}
          month={row.month.toISOString()}
          monthLabel={monthLabel}
          totalBudget={row.totalBudget}
          defaults={{
            saldoAwal: row.saldoAwal,
            monthlyIncome: row.monthlyIncome,
            saldoAkhirActual: row.saldoAkhirActual,
          }}
        />
      </FormDialog>
      <Button variant="ghost" size="icon" nativeButton={false} render={<Link href={`/cashflow/${monthSlug}`} />}>
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

export function CashflowTable({ rows }: Readonly<{ rows: CashflowRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Month</TableHead>
              <TableHead className="text-right">Starting Balance</TableHead>
              <TableHead className="text-right">Ending Balance (Expected)</TableHead>
              <TableHead className="text-right">Ending Balance (Actual)</TableHead>
              <TableHead className="text-right">Variance</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.month.toISOString()}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {format(row.month, "MMMM yyyy")}
                    {row.isDefaultTemplate && (
                      <Badge variant="outline" className="text-[10px]">
                        Default
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">{formatIDR(row.saldoAwal)}</TableCell>
                <TableCell className="text-right">{formatIDR(row.saldoAkhirExpected)}</TableCell>
                <TableCell className="text-right">
                  {row.saldoAkhirActual != null ? formatIDR(row.saldoAkhirActual) : "-"}
                </TableCell>
                <TableCell
                  className={
                    "text-right " +
                    (row.variance == null
                      ? "text-muted-foreground"
                      : row.variance >= 0
                        ? "text-positive"
                        : "text-destructive")
                  }
                >
                  {row.variance != null ? `${row.variance > 0 ? "+" : ""}${formatIDR(row.variance)}` : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <CashflowRowActions row={row} />
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
              action={row.isDefaultTemplate && <Badge variant="outline">Default</Badge>}
            />
            <MobileRowField label="Starting Balance" value={formatIDR(row.saldoAwal)} />
            <MobileRowField
              label="Ending Balance (Expected)"
              value={formatIDR(row.saldoAkhirExpected)}
            />
            <MobileRowField
              label="Ending Balance (Actual)"
              value={row.saldoAkhirActual != null ? formatIDR(row.saldoAkhirActual) : "-"}
            />
            <MobileRowField
              label="Variance"
              value={row.variance != null ? `${row.variance > 0 ? "+" : ""}${formatIDR(row.variance)}` : "-"}
              valueClassName={
                row.variance == null
                  ? "text-muted-foreground"
                  : row.variance >= 0
                    ? "text-positive"
                    : "text-destructive"
              }
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
