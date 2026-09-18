import { Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { InvestmentFormFields } from "@/components/investments/investment-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateInvestment, deleteInvestment } from "@/lib/actions/investments";
import type { getInvestments } from "@/lib/queries/investments";
import { formatIDR } from "@/lib/format";

type InvestmentRow = Awaited<ReturnType<typeof getInvestments>>[number];

function InvestmentRowActions({
  item,
  buy,
  current,
}: Readonly<{ item: InvestmentRow; buy: number; current: number }>) {
  return (
    <>
      <FormDialog
        title="Edit Investment"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateInvestment.bind(null, item.id)}
      >
        <InvestmentFormFields
          idPrefix={item.id}
          defaults={{
            platform: item.platform,
            name: item.name,
            buyValue: buy,
            currentValue: current,
          }}
        />
      </FormDialog>
      <DeleteButton action={deleteInvestment.bind(null, item.id)} />
    </>
  );
}

export function InvestmentTable({ rows }: Readonly<{ rows: InvestmentRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Buy Value</TableHead>
              <TableHead className="text-right">Current Value</TableHead>
              <TableHead className="text-right">Return</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((investment, index) => {
              const buy = Number(investment.buyValue);
              const current = Number(investment.currentValue);
              const returnValue = current - buy;
              return (
                <TableRow key={investment.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>{investment.platform}</TableCell>
                  <TableCell>{investment.name}</TableCell>
                  <TableCell className="text-right">{formatIDR(buy)}</TableCell>
                  <TableCell className="text-right">{formatIDR(current)}</TableCell>
                  <TableCell
                    className={
                      "text-right " + (returnValue >= 0 ? "text-positive" : "text-destructive")
                    }
                  >
                    {returnValue >= 0 ? "+" : ""}
                    {formatIDR(returnValue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <InvestmentRowActions item={investment} buy={buy} current={current} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No investments yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((investment) => {
          const buy = Number(investment.buyValue);
          const current = Number(investment.currentValue);
          const returnValue = current - buy;
          return (
            <MobileRowCard key={investment.id}>
              <MobileRowHeader title={`${investment.platform} · ${investment.name}`} />
              <MobileRowField label="Buy Value" value={formatIDR(buy)} />
              <MobileRowField label="Current Value" value={formatIDR(current)} />
              <MobileRowField
                label="Return"
                value={`${returnValue >= 0 ? "+" : ""}${formatIDR(returnValue)}`}
                valueClassName={returnValue >= 0 ? "text-positive" : "text-destructive"}
              />
              <MobileRowActions>
                <InvestmentRowActions item={investment} buy={buy} current={current} />
              </MobileRowActions>
            </MobileRowCard>
          );
        })}
        {rows.length === 0 && <MobileEmptyState>No investments yet.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
