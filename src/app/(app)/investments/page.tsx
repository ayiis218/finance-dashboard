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
import { FormDialog } from "@/components/form-dialog";
import { DeleteButton } from "@/components/delete-button";
import { prisma } from "@/lib/prisma";
import { createInvestment, deleteInvestment } from "@/lib/actions";
import { formatIDR } from "@/lib/format";

export default async function InvestmentsPage() {
  const investments = await prisma.investment.findMany({
    orderBy: { platform: "asc" },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
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
                    <DeleteButton action={deleteInvestment.bind(null, items.id)} />
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
  );
}
