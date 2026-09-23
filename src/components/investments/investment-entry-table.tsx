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
import {
  InvestmentEntryFormFields,
  type InvestmentEntryFormDefaults,
} from "@/components/investments/investment-entry-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateInvestmentEntry, deleteInvestmentEntry } from "@/lib/actions/investment-entries";
import type { getInvestmentYearOverview } from "@/lib/queries/investment-targets";
import { formatIDR } from "@/lib/format";

type EntryRow = Awaited<ReturnType<typeof getInvestmentYearOverview>>["rows"][number];
type InvestmentOption = { id: string; platform: string; name: string };

function EntryRowActions({
  row,
  year,
  investments,
}: Readonly<{ row: EntryRow; year: number; investments: InvestmentOption[] }>) {
  const defaults: InvestmentEntryFormDefaults = {
    investmentId: row.investmentId,
    month: row.month.toISOString(),
    amount: row.amount,
  };
  return (
    <>
      <FormDialog
        title="Edit Entry Investasi"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateInvestmentEntry.bind(null, row.id)}
      >
        <InvestmentEntryFormFields
          idPrefix={row.id}
          year={year}
          investments={investments}
          defaults={defaults}
        />
      </FormDialog>
      <DeleteButton action={deleteInvestmentEntry.bind(null, row.id)} />
    </>
  );
}

export function InvestmentEntryTable({
  rows,
  year,
  investments,
}: Readonly<{ rows: EntryRow[]; year: number; investments: InvestmentOption[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Bulan</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Instrumen</TableHead>
              <TableHead className="text-right">Nominal</TableHead>
              <TableHead className="text-center">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>
                  {row.month.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </TableCell>
                <TableCell>{row.platform}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="text-right">{formatIDR(row.amount)}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <EntryRowActions row={row} year={year} investments={investments} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada entry investasi untuk {year}.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((row) => (
          <MobileRowCard key={row.id}>
            <MobileRowHeader
              title={`${row.month.toLocaleDateString("id-ID", { month: "long", year: "numeric" })} · ${row.platform}`}
            />
            <MobileRowField label="Instrumen" value={row.name} />
            <MobileRowField label="Nominal" value={formatIDR(row.amount)} />
            <MobileRowActions>
              <EntryRowActions row={row} year={year} investments={investments} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && (
          <MobileEmptyState>Belum ada entry investasi untuk {year}.</MobileEmptyState>
        )}
      </MobileCardList>
    </>
  );
}
