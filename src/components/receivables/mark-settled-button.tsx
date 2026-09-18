"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MarkSettledButton({
  action,
}: Readonly<{ action: () => Promise<void> }>) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      try {
        await action();
        toast.success("Marked as settled");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to mark as settled");
      }
    });
  };

  return (
    <Button
      variant="link"
      size="sm"
      className="h-auto p-0 text-xs"
      disabled={isPending}
      onClick={handleClick}
    >
      {isPending && <Loader2 className="size-3 animate-spin" />}
      {isPending ? "Marking..." : "Mark as settled"}
    </Button>
  );
}
