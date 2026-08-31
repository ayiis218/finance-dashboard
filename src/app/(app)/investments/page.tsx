export const dynamic = "force-dynamic";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { SummaryStats } from "@/components/summary-stats";
import { prisma } from "@/lib/prisma";
import { createInvestment, deleteInvestment, updateInvestment } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function InvestmentsPage() {
  const investments = await prisma.investment.findMany({
    orderBy: { platform: "asc" },
  });

  const totalModal = investments.reduce((sum, i) => sum + Number(i.buyValue), 0);
  const totalNilai = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
  const gainLoss = totalNilai - totalModal;
  const gainLossPct = totalModal > 0 ? (gainLoss / totalModal) * 100 : 0;

  const summaryItems = [
    { label: "Total Modal", value: formatIDR(totalModal) },
    { label: "Total Nilai Sekarang", value: formatIDR(totalNilai), tone: "highlight" as const },
    {
      label: "Gain/Loss",
      value: `${gainLoss >= 0 ? "+" : ""}${formatIDR(gainLoss)}`,
      sublabel: `${gainLossPct >= 0 ? "+" : ""}${gainLossPct.toFixed(1)}%`,
      tone: gainLoss >= 0 ? ("positive" as const) : ("negative" as const),
    },
    { label: "Jumlah Investasi", value: String(investments.length) },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle>Investasi</CardTitle>
        <FormDialog
          title="Tambah Investasi"
          triggerLabel="Tambah"
          action={createInvestment}
        >
          <div className="space-y-2">
            <Label htmlFor="platform">Platform</Label>
            <Input id="platform" name="platform" placeholder="Bibit, Ajaib, Indodax, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama Instrumen</Label>
            <Input id="name" name="name" placeholder="Reksadana X, Saham Y, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyValue">Nilai Beli</Label>
            <Input id="buyValue" name="buyValue" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentValue">Nilai Sekarang</Label>
            <Input id="currentValue" name="currentValue" type="number" required />
          </div>
        </FormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead className="text-right">Nilai Beli</TableHead>
              <TableHead className="text-right">Nilai Sekarang</TableHead>
              <TableHead className="text-right">Return</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {investments.map((items) => {
              const buy = Number(items.buyValue);
              const current = Number(items.currentValue);
              const returnValue = current - buy;
              return (
                <TableRow key={items.id}>
                  <TableCell>{items.platform}</TableCell>
                  <TableCell>{items.name}</TableCell>
                  <TableCell className="text-right">{formatIDR(buy)}</TableCell>
                  <TableCell className="text-right">{formatIDR(current)}</TableCell>
                  <TableCell
                    className={
                      "text-right " +
                      (returnValue >= 0 ? "text-green-600" : "text-red-600")
                    }
                  >
                    {returnValue >= 0 ? "+" : ""}
                    {formatIDR(returnValue)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <FormDialog
                        title="Edit Investasi"
                        triggerIcon={<Pencil className="size-4" />}
                        triggerVariant="ghost"
                        triggerSize="icon"
                        action={updateInvestment.bind(null, items.id)}
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`platform-${items.id}`}>Platform</Label>
                          <Input
                            id={`platform-${items.id}`}
                            name="platform"
                            defaultValue={items.platform}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`name-${items.id}`}>Nama Instrumen</Label>
                          <Input
                            id={`name-${items.id}`}
                            name="name"
                            defaultValue={items.name}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`buyValue-${items.id}`}>Nilai Beli</Label>
                          <Input
                            id={`buyValue-${items.id}`}
                            name="buyValue"
                            type="number"
                            defaultValue={buy}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`currentValue-${items.id}`}>Nilai Sekarang</Label>
                          <Input
                            id={`currentValue-${items.id}`}
                            name="currentValue"
                            type="number"
                            defaultValue={current}
                            required
                          />
                        </div>
                      </FormDialog>
                      <DeleteButton action={deleteInvestment.bind(null, items.id)} />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {investments.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Belum ada investasi.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      </Card>
    </div>
  );
}
