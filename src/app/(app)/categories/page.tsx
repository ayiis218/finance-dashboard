export const dynamic = "force-dynamic";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteButton } from "@/components/delete-button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { getCategories } from "@/lib/queries/categories";
import { createCategory, renameCategory, deleteCategory } from "@/lib/actions/categories";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Kelola Kategori</CardTitle>
            <CardDescription>
              Rename di sini otomatis menggabungkan semua transaksi/aset/goal item lama yang
              masih pakai nama kategori tersebut.
            </CardDescription>
          </div>
          <FormDialog title="Add Category" triggerLabel="Add" action={createCategory}>
            <div className="space-y-2">
              <Label htmlFor="name-new-category">Name</Label>
              <Input id="name-new-category" name="name" placeholder="Food, Transport, etc." required />
            </div>
          </FormDialog>
        </CardHeader>
        <CardContent>
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.name}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <FormDialog
                          title="Rename Category"
                          triggerLabel="Rename"
                          triggerVariant="outline"
                          action={renameCategory.bind(null, c.id)}
                        >
                          <div className="space-y-2">
                            <Label htmlFor={`name-${c.id}`}>Name</Label>
                            <Input id={`name-${c.id}`} name="name" defaultValue={c.name} required />
                          </div>
                        </FormDialog>
                        <DeleteButton action={deleteCategory.bind(null, c.id)} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Belum ada kategori.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <MobileCardList>
            {categories.map((c) => (
              <MobileRowCard key={c.id}>
                <MobileRowHeader title={c.name} />
                <MobileRowActions>
                  <FormDialog
                    title="Rename Category"
                    triggerLabel="Rename"
                    triggerVariant="outline"
                    action={renameCategory.bind(null, c.id)}
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`name-m-${c.id}`}>Name</Label>
                      <Input id={`name-m-${c.id}`} name="name" defaultValue={c.name} required />
                    </div>
                  </FormDialog>
                  <DeleteButton action={deleteCategory.bind(null, c.id)} />
                </MobileRowActions>
              </MobileRowCard>
            ))}
            {categories.length === 0 && <MobileEmptyState>Belum ada kategori.</MobileEmptyState>}
          </MobileCardList>
        </CardContent>
      </Card>
    </div>
  );
}
