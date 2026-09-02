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
import { updateInvestment, deleteInvestment } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

type InvestmentRow = {
  id: string;
  platform: string;
  name: string;
  buyValue: unknown;
  currentValue: unknown;
};

function InvestmentRowActions({
  item,
  buy,
  current,
}: Readonly<{ item: InvestmentRow; buy: number; current: number }>) {
  return (
    <>
      <FormDialog
        title="Edit Investasi"
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
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Nilai Beli</TableHead>
              <TableHead className="text-right">Nilai Sekarang</TableHead>
              <TableHead className="text-right">Return</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((items, index) => {
              const buy = Number(items.buyValue);
              const current = Number(items.currentValue);
              const returnValue = current - buy;
              return (
                <TableRow key={items.id}>
                  <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                  <TableCell>{items.platform}</TableCell>
                  <TableCell>{items.name}</TableCell>
                  <TableCell className="text-right">{formatIDR(buy)}</TableCell>
                  <TableCell className="text-right">{formatIDR(current)}</TableCell>
                  <TableCell
                    className={
                      "text-right " + (returnValue >= 0 ? "text-green-600" : "text-red-600")
                    }
                  >
                    {returnValue >= 0 ? "+" : ""}
                    {formatIDR(returnValue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <InvestmentRowActions item={items} buy={buy} current={current} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Belum ada investasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((items) => {
          const buy = Number(items.buyValue);
          const current = Number(items.currentValue);
          const returnValue = current - buy;
          return (
            <MobileRowCard key={items.id}>
              <MobileRowHeader title={`${items.platform} · ${items.name}`} />
              <MobileRowField label="Nilai Beli" value={formatIDR(buy)} />
              <MobileRowField label="Nilai Sekarang" value={formatIDR(current)} />
              <MobileRowField
                label="Return"
                value={`${returnValue >= 0 ? "+" : ""}${formatIDR(returnValue)}`}
                valueClassName={returnValue >= 0 ? "text-green-600" : "text-red-600"}
              />
              <MobileRowActions>
                <InvestmentRowActions item={items} buy={buy} current={current} />
              </MobileRowActions>
            </MobileRowCard>
          );
        })}
        {rows.length === 0 && <MobileEmptyState>Belum ada investasi.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
