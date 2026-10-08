import { describe, expect, it } from "vitest";
import { computeCashflowYearRows } from "@/lib/queries/cashflow";

const TEMPLATE = { monthlyIncome: 10_000_000, items: [{ amount: 7_000_000 }] };

describe("computeCashflowYearRows", () => {
  it("carries the ending balance of each month forward as next month's saldoAwal", () => {
    const rows = computeCashflowYearRows(2026, new Map(), TEMPLATE, 0);

    expect(rows[0].saldoAwal).toBe(0);
    expect(rows[0].saldoAkhirExpected).toBe(3_000_000); // 10jt - 7jt
    expect(rows[1].saldoAwal).toBe(3_000_000);
    expect(rows[1].saldoAkhirExpected).toBe(6_000_000);
    expect(rows[11].saldoAkhirExpected).toBe(3_000_000 * 12);
  });

  it("prefers a materialized month's saldoAkhirActual over its expected value for the next month's carry-forward", () => {
    const forecastByMonth = new Map([
      [
        0,
        {
          id: "jan",
          saldoAwal: 0,
          monthlyIncome: 10_000_000,
          saldoAkhirActual: 1_000_000, // meleset dari expected (3jt) — aktual lebih kecil
          budgetItems: [{ amount: 7_000_000 }],
        },
      ],
    ]);

    const rows = computeCashflowYearRows(2026, forecastByMonth, TEMPLATE, 0);

    expect(rows[0].saldoAkhirExpected).toBe(3_000_000);
    expect(rows[0].saldoAkhirActual).toBe(1_000_000);
    // Februari (default template, belum dimaterialisasi) harus mulai dari AKTUAL Januari, bukan expected.
    expect(rows[1].saldoAwal).toBe(1_000_000);
  });

  it("uses the resolved januaryCarryForward when January itself isn't materialized", () => {
    const rows = computeCashflowYearRows(2026, new Map(), TEMPLATE, 25_000_000);
    expect(rows[0].saldoAwal).toBe(25_000_000);
  });

  it("ignores januaryCarryForward when January is already materialized", () => {
    const forecastByMonth = new Map([
      [
        0,
        {
          id: "jan",
          saldoAwal: 5_000_000,
          monthlyIncome: 10_000_000,
          saldoAkhirActual: null,
          budgetItems: [{ amount: 7_000_000 }],
        },
      ],
    ]);

    // januaryCarryForward=99jt sengaja dioper tapi harus diabaikan karena Januari sudah punya row sendiri.
    const rows = computeCashflowYearRows(2026, forecastByMonth, TEMPLATE, 99_000_000);
    expect(rows[0].saldoAwal).toBe(5_000_000);
  });
});
