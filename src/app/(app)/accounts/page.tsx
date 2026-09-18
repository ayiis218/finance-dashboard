export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { AccountFormFields } from "@/components/accounts/account-form-fields";
import { AccountTable } from "@/components/accounts/account-table";
import { getBankAccounts } from "@/lib/queries/accounts";
import { createBankAccount } from "@/lib/actions/accounts";
import { formatIDR } from "@/lib/format";

export default async function AccountsPage() {
  const accounts = await getBankAccounts();

  const totalBalance = accounts.reduce((sum, account) => sum + Number(account.balance), 0);

  const summaryItems = [
    { label: "Total Balance", value: formatIDR(totalBalance), tone: "highlight" as const },
    { label: "Number of Accounts", value: String(accounts.length) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Accounts &amp; Cash</CardTitle>
          <FormDialog title="Add Account" triggerLabel="Add" action={createBankAccount}>
            <AccountFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <AccountTable rows={accounts} />
        </CardContent>
      </Card>
    </div>
  );
}
