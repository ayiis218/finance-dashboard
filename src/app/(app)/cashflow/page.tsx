export const dynamic = "force-dynamic";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { CashflowFormFields } from "@/components/cashflow/cashflow-form-fields";
import { CashflowTable } from "@/components/cashflow/cashflow-table";
import { getCashflowForecasts } from "@/lib/queries";
import { createCashflowForecast } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

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
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Cashflow Forecast</CardTitle>
          <FormDialog title="Tambah Forecast" triggerLabel="Tambah" action={createCashflowForecast}>
            <CashflowFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <CashflowTable rows={forecasts} />
        </CardContent>
      </Card>
    </div>
  );
}
