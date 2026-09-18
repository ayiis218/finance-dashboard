import { formatDate } from "date-fns";
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
import { AssetFormFields } from "@/components/assets/asset-form-fields";
import {
  MobileCardList,
  MobileEmptyState,
  MobileRowActions,
  MobileRowCard,
  MobileRowField,
  MobileRowHeader,
} from "@/components/mobile-row-card";
import { updateAsset, deleteAsset } from "@/lib/actions/assets";
import type { getAssets } from "@/lib/queries/assets";
import { formatIDR } from "@/lib/format";

type AssetRow = Awaited<ReturnType<typeof getAssets>>[number];

function AssetRowActions({ item }: Readonly<{ item: AssetRow }>) {
  return (
    <>
      <FormDialog
        title="Edit Asset"
        triggerIcon={<Pencil className="size-4" />}
        triggerVariant="ghost"
        triggerSize="icon"
        action={updateAsset.bind(null, item.id)}
      >
        <AssetFormFields
          idPrefix={item.id}
          defaults={{
            name: item.name,
            category: item.category,
            value: Number(item.value),
            acquiredDate: formatDate(item.acquiredDate, "yyyy-MM-dd"),
          }}
        />
      </FormDialog>
      <DeleteButton action={deleteAsset.bind(null, item.id)} />
    </>
  );
}

export function AssetTable({ rows }: Readonly<{ rows: AssetRow[] }>) {
  return (
    <>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((asset, index) => (
              <TableRow key={asset.id}>
                <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                <TableCell>{asset.name}</TableCell>
                <TableCell>{asset.category}</TableCell>
                <TableCell>{formatDate(asset.acquiredDate, "dd MMMM yyyy")}</TableCell>
                <TableCell className="text-right">{formatIDR(Number(asset.value))}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <AssetRowActions item={asset} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No assets yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <MobileCardList>
        {rows.map((asset) => (
          <MobileRowCard key={asset.id}>
            <MobileRowHeader title={asset.name} />
            <MobileRowField label="Category" value={asset.category} />
            <MobileRowField label="Date" value={formatDate(asset.acquiredDate, "dd MMM yyyy")} />
            <p className="text-lg font-semibold">{formatIDR(Number(asset.value))}</p>
            <MobileRowActions>
              <AssetRowActions item={asset} />
            </MobileRowActions>
          </MobileRowCard>
        ))}
        {rows.length === 0 && <MobileEmptyState>No assets yet.</MobileEmptyState>}
      </MobileCardList>
    </>
  );
}
