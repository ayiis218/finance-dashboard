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
import { createAsset, deleteAsset } from "@/lib/actions";
import { formatIDR } from "@/lib/format";
import { formatDate } from "date-fns";

export default async function AssetsPage() {
  const assets = await prisma.asset.findMany({
    orderBy: { acquiredDate: "desc" },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
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
                  <DeleteButton action={deleteAsset.bind(null, items.id)} />
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
  );
}
