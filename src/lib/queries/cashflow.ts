import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/queries/shared";

export async function getCashflowForecasts() {
  const forecasts = await prisma.cashflowForecast.findMany({
    orderBy: { month: "desc" },
  });
  return forecasts.map((f) => {
    const saldoAkhirActual =
      f.saldoAkhirActual != null ? toNumber(f.saldoAkhirActual) : null;
    const saldoAkhirExpected =
      f.saldoAkhirExpected != null ? toNumber(f.saldoAkhirExpected) : null;
    return {
      id: f.id,
      month: f.month,
      saldoAwal: toNumber(f.saldoAwal),
      saldoAkhirActual,
      saldoAkhirExpected,
      variance:
        saldoAkhirActual != null && saldoAkhirExpected != null
          ? saldoAkhirActual - saldoAkhirExpected
          : null,
    };
  });
}
