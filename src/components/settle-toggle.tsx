"use client";

import { useTransition } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function SettleToggle({
  checked,
  action,
}: {
  checked: boolean;
  action: (next: boolean) => Promise<void>;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Checkbox
      checked={checked}
      disabled={isPending}
      onCheckedChange={(value) =>
        startTransition(() => action(value === true))
      }
    />
  );
}
