"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";

export function MarkSettledButton({
  action,
}: Readonly<{ action: () => Promise<void> }>) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="link"
      size="sm"
      className="h-auto p-0 text-xs"
      disabled={isPending}
      onClick={() => startTransition(() => action())}
    >
      Tandai lunas manual
    </Button>
  );
}
