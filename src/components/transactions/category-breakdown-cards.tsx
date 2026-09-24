import { ChevronDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BreakdownPieCard } from "@/components/breakdown-pie-card";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { formatIDR } from "@/lib/format";

type CategoryTotal = { category: string; total: number };
type CategoryDetailed = { category: string; total: number; count: number; percentage: number };

export function CategoryBreakdownCards({
  rangeLabel,
  expenseByCategory,
  spendingDetailed,
}: Readonly<{
  rangeLabel: string;
  expenseByCategory: CategoryTotal[];
  spendingDetailed: CategoryDetailed[];
}>) {
  const spendingTotal = spendingDetailed.reduce((sum, c) => sum + c.total, 0);
  const spendingCount = spendingDetailed.reduce((sum, c) => sum + c.count, 0);

  return (
    <>
      <BreakdownPieCard
        title="Expense by Category"
        description={`${rangeLabel} — potongan lebih besar berarti kategori itu menghabiskan porsi pengeluaran paling banyak`}
        data={expenseByCategory.map((c) => ({ name: c.category, value: c.total }))}
      />

      <Card>
        <details>
          <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-3 bg-gradient-to-r from-primary/5 to-transparent">
              <div>
                <CardTitle>Expense Breakdown by Category</CardTitle>
                <CardDescription>{rangeLabel} — diurutkan dari yang paling besar</CardDescription>
              </div>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform [details[open]_&]:rotate-180" />
            </CardHeader>
          </summary>
          <CardContent>
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No.</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Transactions</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">% of Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spendingDetailed.map((c, index) => (
                    <TableRow key={c.category}>
                      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                      <TableCell>{c.category}</TableCell>
                      <TableCell className="text-center">{c.count}</TableCell>
                      <TableCell className="text-right">{formatIDR(c.total)}</TableCell>
                      <TableCell className="text-right">{c.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                  {spendingDetailed.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No expenses in this period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                {spendingDetailed.length > 0 && (
                  <TableFooter>
                    <TableRow>
                      <TableCell />
                      <TableCell className="font-medium">Total</TableCell>
                      <TableCell className="text-center font-medium">{spendingCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatIDR(spendingTotal)}
                      </TableCell>
                      <TableCell className="text-right font-medium">100%</TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>

            <MobileCardList>
              {spendingDetailed.map((c) => (
                <MobileRowCard key={c.category}>
                  <MobileRowHeader title={c.category} />
                  <MobileRowField label="Transactions" value={c.count} />
                  <MobileRowField label="% of Total" value={`${c.percentage.toFixed(1)}%`} />
                  <p className="text-lg font-semibold">{formatIDR(c.total)}</p>
                </MobileRowCard>
              ))}
              {spendingDetailed.length === 0 && (
                <MobileEmptyState>No expenses in this period.</MobileEmptyState>
              )}
              {spendingDetailed.length > 0 && (
                <MobileRowCard className="bg-muted/50 font-medium">
                  <MobileRowHeader title="Total" />
                  <MobileRowField label="Transactions" value={spendingCount} />
                  <MobileRowField label="% of Total" value="100%" />
                  <p className="text-lg font-semibold">{formatIDR(spendingTotal)}</p>
                </MobileRowCard>
              )}
            </MobileCardList>
          </CardContent>
        </details>
      </Card>
    </>
  );
}
