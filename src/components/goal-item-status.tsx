"use client";

import { useTransition } from "react";
import { Badge } from "@/components/ui/badge";

const STATUS_FLOW = ["PLANNED", "BOOKED", "PAID"] as const;
type Status = (typeof STATUS_FLOW)[number];

const STATUS_LABEL: Record<Status, string> = {
  PLANNED: "Rencana",
  BOOKED: "Dipesan",
  PAID: "Lunas",
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
    startTransition(() => onChange(nextStatus));
  };

  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className="cursor-pointer select-none"
      onClick={next}
      aria-disabled={isPending}
    >
      {STATUS_LABEL[status]}
    </Badge>
  );
}
