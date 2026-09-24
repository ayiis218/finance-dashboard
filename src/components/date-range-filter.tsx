import Link from "next/link";
import { format, isValid, parse, startOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function buildHref(baseHref: string, from: Date, to: Date) {
  const params = new URLSearchParams();
  params.set("from", format(from, "yyyy-MM-dd"));
  params.set("to", format(to, "yyyy-MM-dd"));
  return `${baseHref}?${params.toString()}`;
}

/**
 * Single source of truth for the `?from=yyyy-MM-dd&to=yyyy-MM-dd` contract
 * this filter's own inputs/presets produce. Falls back to the given defaults
 * for missing *or unparseable* values — a malformed/hand-edited query string
 * must never reach the caller as an Invalid Date.
 */
export function parseDateRangeParams(
  fromParam: string | undefined,
  toParam: string | undefined,
  defaultFrom: Date,
  defaultTo: Date = new Date(),
): { from: Date; to: Date } {
  const parsedFrom = fromParam ? parse(fromParam, "yyyy-MM-dd", new Date()) : defaultFrom;
  const parsedTo = toParam ? parse(toParam, "yyyy-MM-dd", new Date()) : defaultTo;
  let from = isValid(parsedFrom) ? parsedFrom : defaultFrom;
  let to = isValid(parsedTo) ? parsedTo : defaultTo;
  if (from > to) [from, to] = [to, from];
  return { from, to };
}

export function DateRangeFilter({
  from,
  to,
  baseHref,
}: Readonly<{ from: Date; to: Date; baseHref: string }>) {
  const today = new Date();
  const presets = [
    { label: "30 Days", from: subDays(today, 29), to: today },
    { label: "This Month", from: startOfMonth(today), to: today },
    { label: "3 Months", from: startOfMonth(subMonths(today, 2)), to: today },
    { label: "6 Months", from: startOfMonth(subMonths(today, 5)), to: today },
    { label: "This Year", from: startOfYear(today), to: today },
  ];

  const isActive = (presetFrom: Date, presetTo: Date) =>
    format(presetFrom, "yyyy-MM-dd") === format(from, "yyyy-MM-dd") &&
    format(presetTo, "yyyy-MM-dd") === format(to, "yyyy-MM-dd");

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={isActive(preset.from, preset.to) ? "default" : "outline"}
            size="sm"
            nativeButton={false}
            render={<Link href={buildHref(baseHref, preset.from, preset.to)} />}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <form
        method="get"
        action={baseHref}
        className="flex flex-wrap items-end justify-center gap-2"
      >
        <div className="space-y-1">
          <Label htmlFor="from" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input id="from" name="from" type="date" defaultValue={format(from, "yyyy-MM-dd")} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input id="to" name="to" type="date" defaultValue={format(to, "yyyy-MM-dd")} required />
        </div>
        <Button type="submit" size="sm">
          Apply
        </Button>
      </form>
    </div>
  );
}
