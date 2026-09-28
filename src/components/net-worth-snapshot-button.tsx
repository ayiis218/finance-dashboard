"use client";

import { useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { captureNetWorthSnapshotAction } from "@/lib/actions/dashboard";

export function NetWorthSnapshotButton() {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await captureNetWorthSnapshotAction();
        toast.success("Snapshot net worth tersimpan");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal mengambil snapshot");
      }
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
      Ambil Snapshot Sekarang
    </Button>
  );
}
