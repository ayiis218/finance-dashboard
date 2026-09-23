import { SummaryStats } from "@/components/summary-stats";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function YearlyTargetSummary({
  targetAmount,
  totalInvested,
  remaining,
  progressPct,
  monthsWithEntry,
}: Readonly<{
  targetAmount: number;
  totalInvested: number;
  remaining: number;
  progressPct: number;
  monthsWithEntry: Set<number>;
}>) {
  const achieved = targetAmount > 0 && totalInvested >= targetAmount;
  const surplus = totalInvested - targetAmount;

  const summaryItems = [
    { label: "Annual Target", value: formatIDR(targetAmount) },
    {
      label: "Total Invested",
      value: formatIDR(totalInvested),
      tone: "highlight" as const,
    },
    achieved
      ? {
          label: "Target Achieved",
          value: `+${formatIDR(surplus)}`,
          tone: "positive" as const,
        }
      : { label: "Remaining Target", value: formatIDR(remaining) },
    { label: "Progress", value: `${Math.min(progressPct, 100).toFixed(1)}%` },
  ];

  return (
    <div className="space-y-4">
      <SummaryStats items={summaryItems} />
      <div className="flex flex-wrap gap-1.5">
        {MONTH_LABELS.map((label, i) => (
          <Badge
            key={label}
            variant={monthsWithEntry.has(i) ? "default" : "outline"}
            className={cn(!monthsWithEntry.has(i) && "text-muted-foreground")}
          >
            {label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
