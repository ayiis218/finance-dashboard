/**
 * Money-weighted return (XIRR) lewat Newton-Raphson — tidak ada bentuk
 * closed-form untuk arus kas tidak beraturan seperti kontribusi bulanan.
 * Konvensi tanda: kontribusi/modal keluar = negatif, nilai yang diterima
 * (mis. currentValue hari ini) = positif. Return `null` kalau datanya kurang
 * (<2 arus kas) atau iterasi tidak konvergen — pola "no-data" yang sama
 * dengan `goal-projection.ts`, bukan angka yang menyesatkan.
 */
export function calculateXIRR(cashFlows: { date: Date; amount: number }[]): number | null {
  if (cashFlows.length < 2) return null;

  const sorted = [...cashFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const t0 = sorted[0].date.getTime();
  const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
  const years = (d: Date) => (d.getTime() - t0) / MS_PER_YEAR;

  const npv = (rate: number) =>
    sorted.reduce((sum, cf) => sum + cf.amount / Math.pow(1 + rate, years(cf.date)), 0);
  const npvDerivative = (rate: number) =>
    sorted.reduce(
      (sum, cf) => sum - (years(cf.date) * cf.amount) / Math.pow(1 + rate, years(cf.date) + 1),
      0,
    );

  let rate = 0.1;
  for (let i = 0; i < 100; i++) {
    const value = npv(rate);
    const derivative = npvDerivative(rate);
    if (Math.abs(derivative) < 1e-10) return null;

    const nextRate = rate - value / derivative;
    if (!Number.isFinite(nextRate) || nextRate <= -1) return null;
    if (Math.abs(nextRate - rate) < 1e-7) return nextRate;
    rate = nextRate;
  }

  return null;
}
