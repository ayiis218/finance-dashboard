import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function buildHref(baseHref: string, page: number, extraParams?: Record<string, string | undefined>) {
  const params = new URLSearchParams();
  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) params.set(key, value);
    }
  }
  params.set("page", String(page));
  return `${baseHref}?${params.toString()}`;
}

export function PageNav({
  page,
  totalPages,
  baseHref,
  extraParams,
}: Readonly<{
  page: number;
  totalPages: number;
  baseHref: string;
  extraParams?: Record<string, string | undefined>;
}>) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-center gap-3">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        nativeButton={false}
        render={<Link href={buildHref(baseHref, Math.max(1, page - 1), extraParams)} />}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-28 text-center text-sm font-medium">
        Halaman {page} dari {totalPages}
      </span>
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        nativeButton={false}
        render={<Link href={buildHref(baseHref, Math.min(totalPages, page + 1), extraParams)} />}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
