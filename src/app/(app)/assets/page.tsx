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
import { createAsset, deleteAsset, updateAsset } from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import { formatDate } from "date-fns";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { acquiredDate: "desc" },
  });

  const totalValue = assets.reduce((sum, a) => sum + Number(a.value), 0);
  const latest = assets[0];

  const summaryItems = [
    { label: "Total Nilai Aset", value: formatIDR(totalValue), tone: "highlight" as const },
    { label: "Jumlah Aset", value: String(assets.length) },
    latest
      ? {
          label: "Aset Terbaru",
          value: latest.name,
          sublabel: `${formatIDR(Number(latest.value))} · ${formatDate(latest.acquiredDate, "dd MMM yyyy")}`,
        }
      : { label: "Aset Terbaru", value: "-", sublabel: "Belum ada aset" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
      <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle>Aset</CardTitle>
        <FormDialog title="Tambah Aset" triggerLabel="Tambah" action={createAsset}>
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input id="name" name="name" placeholder="Motor, Laptop, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input id="category" name="category" placeholder="Kendaraan, Elektronik, dll" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Nilai</Label>
            <Input id="value" name="value" type="number" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="acquiredDate">Tanggal Perolehan</Label>
            <Input id="acquiredDate" name="acquiredDate" type="date" required />
          </div>
        </FormDialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="text-right">Nilai</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((items) => (
              <TableRow key={items.id}>
                <TableCell>{items.name}</TableCell>
                <TableCell>{items.category}</TableCell>
                <TableCell>{formatDate(items.acquiredDate, "dd MMMM yyyy")}</TableCell>
                <TableCell className="text-right">
                  {formatIDR(Number(items.value))}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <FormDialog
                      title="Edit Aset"
                      triggerIcon={<Pencil className="size-4" />}
                      triggerVariant="ghost"
                      triggerSize="icon"
                      action={updateAsset.bind(null, items.id)}
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`name-${items.id}`}>Nama</Label>
                        <Input
                          id={`name-${items.id}`}
                          name="name"
                          defaultValue={items.name}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`category-${items.id}`}>Kategori</Label>
                        <Input
                          id={`category-${items.id}`}
                          name="category"
                          defaultValue={items.category}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`value-${items.id}`}>Nilai</Label>
                        <Input
                          id={`value-${items.id}`}
                          name="value"
                          type="number"
                          defaultValue={Number(items.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`acquiredDate-${items.id}`}>Tanggal Perolehan</Label>
                        <Input
                          id={`acquiredDate-${items.id}`}
                          name="acquiredDate"
                          type="date"
                          defaultValue={formatDate(items.acquiredDate, "yyyy-MM-dd")}
                          required
                        />
                      </div>
                    </FormDialog>
                    <DeleteButton action={deleteAsset.bind(null, items.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {assets.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Belum ada aset.
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
