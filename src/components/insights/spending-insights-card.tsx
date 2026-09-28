import { Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CategoryInsight } from "@/lib/queries/insights";

export function SpendingInsightsCard({
  insights,
}: Readonly<{ insights: CategoryInsight[] }>) {
  if (insights.length === 0) return null;

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle>Insight Bulan Ini</CardTitle>
        <CardDescription>Perubahan pengeluaran paling mencolok dibanding bulan lalu</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => {
          const isUp = insight.delta > 0;
          return (
            <div key={insight.category} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                {insight.isNew ? (
                  <Sparkles className="size-4 text-destructive" />
                ) : isUp ? (
                  <TrendingUp className="size-4 text-destructive" />
                ) : (
                  <TrendingDown className="size-4 text-positive" />
                )}
                <span>{insight.category}</span>
              </div>
              {insight.isNew ? (
                <span className="font-medium text-destructive">
                  Kategori baru ({formatIDR(insight.currentTotal)})
                </span>
              ) : (
                <span className={cn("font-medium", isUp ? "text-destructive" : "text-positive")}>
                  {isUp ? "+" : ""}
                  {insight.pctChange!.toFixed(0)}% ({isUp ? "+" : ""}
                  {formatIDR(insight.delta)})
                </span>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
