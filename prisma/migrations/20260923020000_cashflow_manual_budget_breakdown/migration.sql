-- CashflowForecast: balik ke input manual (saldoAwal, saldoAkhirActual),
-- tambah monthlyIncome (gaji bulanan, manual). expectedDelta tidak relevan lagi.
ALTER TABLE "CashflowForecast" DROP COLUMN "expectedDelta";
ALTER TABLE "CashflowForecast" ADD COLUMN "saldoAwal" DECIMAL(65,30) NOT NULL DEFAULT 0;
ALTER TABLE "CashflowForecast" ADD COLUMN "monthlyIncome" DECIMAL(65,30) NOT NULL DEFAULT 0;

-- CashflowBudgetItem: rincian anggaran bebas teks per bulan (Lifestyle, Investasi, Makan, dll)
CREATE TABLE "CashflowBudgetItem" (
  "id"         TEXT NOT NULL,
  "forecastId" TEXT NOT NULL,
  "label"      TEXT NOT NULL,
  "amount"     DECIMAL(65,30) NOT NULL,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CashflowBudgetItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CashflowBudgetItem"
  ADD CONSTRAINT "CashflowBudgetItem_forecastId_fkey"
  FOREIGN KEY ("forecastId") REFERENCES "CashflowForecast"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "CashflowBudgetItem_forecastId_idx" ON "CashflowBudgetItem"("forecastId");
