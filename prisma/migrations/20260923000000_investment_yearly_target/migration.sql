-- Tabel target investasi tahunan
CREATE TABLE "InvestmentYearlyTarget" (
  "id"           TEXT NOT NULL,
  "year"         INTEGER NOT NULL,
  "targetAmount" DECIMAL(65,30) NOT NULL,
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP(3) NOT NULL,
  CONSTRAINT "InvestmentYearlyTarget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InvestmentYearlyTarget_year_key" ON "InvestmentYearlyTarget"("year");
