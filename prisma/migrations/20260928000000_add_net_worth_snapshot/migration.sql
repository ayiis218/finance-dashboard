-- Foto bulanan posisi keuangan (Bagian 2 rencana 4-fitur), dipakai untuk grafik net worth historis
CREATE TABLE "NetWorthSnapshot" (
  "id"               TEXT NOT NULL,
  "date"             TIMESTAMP(3) NOT NULL,
  "totalBalance"     DECIMAL(65,30) NOT NULL,
  "totalAssets"      DECIMAL(65,30) NOT NULL,
  "totalInvestments" DECIMAL(65,30) NOT NULL,
  "totalReceivables" DECIMAL(65,30) NOT NULL,
  "totalDebt"        DECIMAL(65,30) NOT NULL,
  "netWorth"         DECIMAL(65,30) NOT NULL,
  "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NetWorthSnapshot_date_key" ON "NetWorthSnapshot"("date");
