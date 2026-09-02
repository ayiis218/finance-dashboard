import Link from "next/link";
import { addMonths, format, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function buildHref(baseHref: string, month: string, extraParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  params.set("month", month);
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
  }
  return `${baseHref}?${params.toString()}`;
}

export function MonthNav({
  month,
  baseHref,
  extraParams,
}: Readonly<{
  month: Date;
  baseHref: string;
  extraParams?: Record<string, string | undefined>;
}>) {
  const prevMonth = format(subMonths(month, 1), "yyyy-MM");
  const nextMonth = format(addMonths(month, 1), "yyyy-MM");

  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        nativeButton={false}
        render={<Link href={buildHref(baseHref, prevMonth, extraParams)} />}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-36 text-center text-sm font-medium">
        {format(month, "MMMM yyyy")}
      </span>
      <Button
        variant="outline"
        size="icon"
        nativeButton={false}
        render={<Link href={buildHref(baseHref, nextMonth, extraParams)} />}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
