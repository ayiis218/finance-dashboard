"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteButton({ action }: Readonly<{ action: () => Promise<void> }>) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (!window.confirm("Yakin ingin menghapus data ini?")) return;
    startTransition(async () => {
      try {
        await action();
        toast.success("Berhasil dihapus");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal menghapus");
      }
    });
  };

  return (
    <Button variant="ghost" size="icon" disabled={isPending} onClick={handleClick}>
      <Trash2 className="size-4 text-muted-foreground text-red-500" />
    </Button>
  );
}
