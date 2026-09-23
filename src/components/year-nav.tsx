import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function buildHref(baseHref: string, year: number, extraParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  params.set("year", String(year));
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
  }
  return `${baseHref}?${params.toString()}`;
}

export function YearNav({
  year,
  baseHref,
  extraParams,
}: Readonly<{
  year: number;
  baseHref: string;
  extraParams?: Record<string, string | undefined>;
}>) {
  return (
    <div className="mb-4 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        nativeButton={false}
        render={<Link href={buildHref(baseHref, year - 1, extraParams)} />}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-16 text-center text-sm font-medium">{year}</span>
      <Button
        variant="outline"
        size="icon"
        nativeButton={false}
        render={<Link href={buildHref(baseHref, year + 1, extraParams)} />}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
