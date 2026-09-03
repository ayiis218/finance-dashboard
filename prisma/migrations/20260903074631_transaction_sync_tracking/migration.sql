-- 1. Kolom updatedAt + backfill
ALTER TABLE "Transaction"
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "Transaction" SET "updatedAt" = "createdAt";

CREATE INDEX "Transaction_updatedAt_id_idx" ON "Transaction"("updatedAt", "id");

-- 2. Trigger: updatedAt selalu naik pada UPDATE apa pun,
--    termasuk yang datang dari cascade SetNull (lihat Temuan B)
CREATE OR REPLACE FUNCTION set_transaction_updated_at()
RETURNS TRIGGER AS $fn$
BEGIN
  NEW."updatedAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$fn$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_set_updated_at
  BEFORE UPDATE ON "Transaction"
  FOR EACH ROW EXECUTE FUNCTION set_transaction_updated_at();

-- 3. Tabel tombstone
CREATE TABLE "DeletedTransaction" (
  "id"        TEXT NOT NULL,
  "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeletedTransaction_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "DeletedTransaction_deletedAt_id_idx"
  ON "DeletedTransaction"("deletedAt", "id");

-- 4. Trigger: catat SEMUA penghapusan, termasuk cascade dari
--    penghapusan BankAccount (lihat Temuan A)
CREATE OR REPLACE FUNCTION log_deleted_transaction()
RETURNS TRIGGER AS $fn$
BEGIN
  INSERT INTO "DeletedTransaction" ("id", "deletedAt")
  VALUES (OLD."id", CURRENT_TIMESTAMP)
  ON CONFLICT ("id") DO UPDATE SET "deletedAt" = CURRENT_TIMESTAMP;
  RETURN OLD;
END;
$fn$ LANGUAGE plpgsql;

CREATE TRIGGER transaction_log_delete
  AFTER DELETE ON "Transaction"
  FOR EACH ROW EXECUTE FUNCTION log_deleted_transaction();
