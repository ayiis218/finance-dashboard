-- CreateEnum
CREATE TYPE "RecurringFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "RecurringTransaction" (
  "id"             TEXT NOT NULL,
  "accountId"      TEXT NOT NULL,
  "toAccountId"    TEXT,
  "type"           "TransactionType" NOT NULL,
  "category"       TEXT NOT NULL,
  "amount"         DECIMAL(65,30) NOT NULL,
  "note"           TEXT,
  "affectsBalance" BOOLEAN NOT NULL DEFAULT true,
  "frequency"      "RecurringFrequency" NOT NULL,
  "startDate"      TIMESTAMP(3) NOT NULL,
  "nextRunDate"    TIMESTAMP(3) NOT NULL,
  "endDate"        TIMESTAMP(3),
  "active"         BOOLEAN NOT NULL DEFAULT true,
  "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"      TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RecurringTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "RecurringTransaction_active_nextRunDate_idx" ON "RecurringTransaction"("active", "nextRunDate");

ALTER TABLE "RecurringTransaction"
  ADD CONSTRAINT "RecurringTransaction_accountId_fkey"
  FOREIGN KEY ("accountId") REFERENCES "BankAccount"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RecurringTransaction"
  ADD CONSTRAINT "RecurringTransaction_toAccountId_fkey"
  FOREIGN KEY ("toAccountId") REFERENCES "BankAccount"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
