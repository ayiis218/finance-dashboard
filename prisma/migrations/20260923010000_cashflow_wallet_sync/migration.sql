-- CashflowForecast: saldoAwal & saldoAkhirExpected jadi derived (live dari wallet), tidak lagi disimpan.
-- expectedDelta baru: rencana perubahan saldo bulan ini (input user, boleh negatif).
ALTER TABLE "CashflowForecast" DROP COLUMN "saldoAwal";
ALTER TABLE "CashflowForecast" DROP COLUMN "saldoAkhirExpected";
ALTER TABLE "CashflowForecast" ADD COLUMN "expectedDelta" DECIMAL(65,30) NOT NULL DEFAULT 0;
