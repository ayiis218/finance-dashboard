export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { RecurringTransactionFormFields } from "@/components/recurring/recurring-transaction-form-fields";
import { RecurringTransactionTable } from "@/components/recurring/recurring-transaction-table";
import { getBankAccounts } from "@/lib/queries/accounts";
import { getCategoryNames } from "@/lib/queries/categories";
import { getRecurringTransactions } from "@/lib/queries/recurring-transactions";
import { createRecurringTransaction } from "@/lib/actions/recurring-transactions";

export default async function RecurringTransactionsPage() {
  const [rows, accountRows, categories] = await Promise.all([
    getRecurringTransactions(),
    getBankAccounts(),
    getCategoryNames(),
  ]);

  const accounts = accountRows.map((a) => ({ id: a.id, name: a.name }));

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recurring Transactions</CardTitle>
            <CardDescription>
              Transaksi yang berulang otomatis (gaji, sewa, langganan, dll) — dijalankan cron
              harian sesuai frekuensinya masing-masing.
            </CardDescription>
          </div>
          <FormDialog title="Add Recurring Transaction" triggerLabel="Add" action={createRecurringTransaction}>
            <RecurringTransactionFormFields idPrefix="new" accounts={accounts} categories={categories} />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <RecurringTransactionTable rows={rows} accounts={accounts} categories={categories} />
        </CardContent>
      </Card>
    </div>
  );
}
