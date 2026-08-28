-- CreateEnum
CREATE TYPE "GoalItemStatus" AS ENUM ('PLANNED', 'BOOKED', 'PAID');

-- AlterTable
ALTER TABLE "SavingsGoalEntry" ADD COLUMN     "contributor" TEXT;

-- CreateTable
CREATE TABLE "RepaymentEntry" (
    "id" TEXT NOT NULL,
    "receivableId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepaymentEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoalItem" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "budgetAmount" DECIMAL(65,30) NOT NULL,
    "actualAmount" DECIMAL(65,30) DEFAULT 0,
    "status" "GoalItemStatus" NOT NULL DEFAULT 'PLANNED',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoalItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RepaymentEntry" ADD CONSTRAINT "RepaymentEntry_receivableId_fkey" FOREIGN KEY ("receivableId") REFERENCES "Receivable"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoalItem" ADD CONSTRAINT "GoalItem_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "SavingsGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

