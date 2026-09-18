export const dynamic = "force-dynamic";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FormDialog } from "@/components/form-dialog";
import { SummaryStats } from "@/components/summary-stats";
import { AssetFormFields } from "@/components/assets/asset-form-fields";
import { AssetTable } from "@/components/assets/asset-table";
import { getAssets } from "@/lib/queries/assets";
import { createAsset } from "@/lib/actions/assets";
import { formatIDR } from "@/lib/format";
import { formatDate } from "date-fns";

export default async function AssetsPage() {
  const assets = await getAssets();

  const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
  const latest = assets[0];

  const summaryItems = [
    { label: "Total Asset Value", value: formatIDR(totalValue), tone: "highlight" as const },
    { label: "Number of Assets", value: String(assets.length) },
    latest
      ? {
          label: "Latest Asset",
          value: latest.name,
          sublabel: `${formatIDR(Number(latest.value))} · ${formatDate(latest.acquiredDate, "dd MMM yyyy")}`,
        }
      : { label: "Latest Asset", value: "-", sublabel: "No assets yet" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <SummaryStats items={summaryItems} />
      <Card>
        <CardHeader className="flex flex-col gap-3 bg-gradient-to-r from-primary/5 to-transparent sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Assets</CardTitle>
          <FormDialog title="Add Asset" triggerLabel="Add" action={createAsset}>
            <AssetFormFields idPrefix="new" />
          </FormDialog>
        </CardHeader>
        <CardContent>
          <AssetTable rows={assets} />
        </CardContent>
      </Card>
    </div>
  );
}
