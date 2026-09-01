-- Fold pocketChange into balance before dropping it, so the value isn't lost
UPDATE "BankAccount" SET "balance" = "balance" + "pocketChange";

-- AlterTable
ALTER TABLE "BankAccount" DROP COLUMN "pocketChange";
