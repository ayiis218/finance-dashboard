"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { StatusStamp } from "@/components/status-stamp";

const STATUS_FLOW = ["PLANNED", "BOOKED", "PAID"] as const;
type Status = (typeof STATUS_FLOW)[number];

const STATUS_LABEL: Record<Status, string> = {
  PLANNED: "Planned",
  BOOKED: "Booked",
  PAID: "Paid",
};

const STATUS_VARIANT: Record<Status, "outline" | "secondary" | "default"> = {
  PLANNED: "outline",
  BOOKED: "secondary",
  PAID: "default",
};

export function GoalItemStatusBadge({
  status,
  onChange,
}: Readonly<{
  status: Status;
  onChange: (next: Status) => Promise<void>;
}>) {
  const [isPending, startTransition] = useTransition();

  const next = () => {
    const currentIndex = STATUS_FLOW.indexOf(status);
    const nextStatus = STATUS_FLOW[(currentIndex + 1) % STATUS_FLOW.length];
    startTransition(async () => {
      try {
        await onChange(nextStatus);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to change status");
      }
    });
  };

  const interactive = {
    onClick: isPending ? undefined : next,
    "aria-disabled": isPending,
    className: "cursor-pointer select-none" + (isPending ? " opacity-50" : ""),
  };

  if (status === "PAID") {
    return <StatusStamp {...interactive}>{STATUS_LABEL[status]}</StatusStamp>;
  }

  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      {...interactive}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
