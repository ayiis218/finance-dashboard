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
import { getCashflowForecasts } from "@/lib/queries";
import {
  createCashflowForecast,
  deleteCashflowForecast,
  updateCashflowForecast,
} from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import { format } from "date-fns";

export default async function CashflowPage() {
  const forecasts = await getCashflowForecasts();
  const latest = forecasts[0];

  const summaryItems = latest
    ? [
        { label: "Saldo Awal", value: formatIDR(latest.saldoAwal) },
        {
          label: "Saldo Akhir (Ekspektasi)",
          value: latest.saldoAkhirExpected != null ? formatIDR(latest.saldoAkhirExpected) : "-",
        },
        {
          label: "Saldo Akhir (Aktual)",
          value: latest.saldoAkhirActual != null ? formatIDR(latest.saldoAkhirActual) : "-",
        },
        {
          label: "Selisih",
          value: latest.selisih != null ? formatIDR(latest.selisih) : "-",
          tone:
            latest.selisih == null
              ? undefined
              : latest.selisih >= 0
                ? ("highlight" as const)
                : ("negative" as const),
        },
      ]
    : [];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      {latest && (
        <>
          <p className="text-sm text-muted-foreground">
            Forecast bulan terbaru &middot; {format(latest.month, "MMMM yyyy")}
          </p>
          <SummaryStats items={summaryItems} />
        </>
      )}
      <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle>Cashflow Forecast</CardTitle>
        <FormDialog
          title="Tambah Forecast"
          triggerLabel="Tambah"
          action={createCashflowForecast}
        >
          <div className="space-y-2">
            <Label htmlFor="month">Bulan</Label>
            <Input id="month" name="month" type="month" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saldoAwal">Saldo Awal</Label>
            <Input id="saldoAwal" name="saldoAwal" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saldoAkhirExpected">Saldo Akhir (Ekspektasi)</Label>
            <Input
              id="saldoAkhirExpected"
              name="saldoAkhirExpected"
              type="number"
              placeholder="Opsional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="saldoAkhirActual">Saldo Akhir (Aktual)</Label>
            <Input
              id="saldoAkhirActual"
              name="saldoAkhirActual"
              type="number"
              placeholder="Opsional"
            />
          </div>
        </FormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bulan</TableHead>
              <TableHead className="text-right">Saldo Awal</TableHead>
              <TableHead className="text-right">Saldo Akhir (Ekspektasi)</TableHead>
              <TableHead className="text-right">Saldo Akhir (Aktual)</TableHead>
              <TableHead className="text-right">Selisih</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecasts.map((f) => (
              <TableRow key={f.id}>
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
                  {f.selisih != null
                    ? `${f.selisih > 0 ? "+" : ""}${formatIDR(f.selisih)}`
                    : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FormDialog
                      title={`Edit Forecast — ${format(f.month, "MMMM yyyy")}`}
                      triggerIcon={<Pencil className="size-4" />}
                      triggerVariant="ghost"
                      triggerSize="icon"
                      action={updateCashflowForecast.bind(null, f.id)}
                    >
                      <p className="text-sm text-muted-foreground">
                        Bulan: {format(f.month, "MMMM yyyy")}
                      </p>
                      <div className="space-y-2">
                        <Label htmlFor={`saldoAwal-${f.id}`}>Saldo Awal</Label>
                        <Input
                          id={`saldoAwal-${f.id}`}
                          name="saldoAwal"
                          type="number"
                          defaultValue={f.saldoAwal}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`saldoAkhirExpected-${f.id}`}>
                          Saldo Akhir (Ekspektasi)
                        </Label>
                        <Input
                          id={`saldoAkhirExpected-${f.id}`}
                          name="saldoAkhirExpected"
                          type="number"
                          defaultValue={f.saldoAkhirExpected ?? ""}
                          placeholder="Opsional"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`saldoAkhirActual-${f.id}`}>
                          Saldo Akhir (Aktual)
                        </Label>
                        <Input
                          id={`saldoAkhirActual-${f.id}`}
                          name="saldoAkhirActual"
                          type="number"
                          defaultValue={f.saldoAkhirActual ?? ""}
                          placeholder="Opsional"
                        />
                      </div>
                    </FormDialog>
                    <DeleteButton action={deleteCashflowForecast.bind(null, f.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {forecasts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada catatan cashflow forecast.
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
