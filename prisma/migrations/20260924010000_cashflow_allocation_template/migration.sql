-- Template alokasi bulanan default (singleton) untuk pre-fill bulan yang belum dimaterialisasi
CREATE TABLE "CashflowAllocationTemplate" (
  "id"            TEXT NOT NULL,
  "monthlyIncome" DECIMAL(65,30) NOT NULL DEFAULT 0,
  "updatedAt"     TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CashflowAllocationTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashflowAllocationTemplateItem" (
  "id"         TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "label"      TEXT NOT NULL,
  "amount"     DECIMAL(65,30) NOT NULL,
  CONSTRAINT "CashflowAllocationTemplateItem_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "CashflowAllocationTemplateItem"
  ADD CONSTRAINT "CashflowAllocationTemplateItem_templateId_fkey"
  FOREIGN KEY ("templateId") REFERENCES "CashflowAllocationTemplate"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "CashflowAllocationTemplateItem_templateId_idx" ON "CashflowAllocationTemplateItem"("templateId");
