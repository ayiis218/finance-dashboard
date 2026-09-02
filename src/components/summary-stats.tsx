import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SummaryStatItem = {
  label: string;
  value: string;
  description?: string;
  sublabel?: string;
  tone?: "default" | "positive" | "negative" | "highlight";
};

export function SummaryStats({ items }: Readonly<{ items: SummaryStatItem[] }>) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card
          key={item.label}
          className={cn(
            item.tone === "highlight"
              ? "bg-brand-gradient border-none text-white"
              : "bg-gradient-to-br from-primary/5 via-card to-accent/10",
          )}
        >
          <CardHeader className="pb-2">
            <CardDescription className={item.tone === "highlight" ? "text-white/80" : undefined}>
              {item.label}
            </CardDescription>
            {item.description && (
              <p
                className={cn(
                  "text-[11px] leading-snug",
                  item.tone === "highlight" ? "text-white/70" : "text-muted-foreground/80",
                )}
              >
                {item.description}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-xl font-semibold",
                item.tone === "positive" && "text-green-600",
                item.tone === "negative" && "text-red-600",
              )}
            >
              {item.value}
            </p>
            {item.sublabel && (
              <p className="mt-1 text-xs text-muted-foreground">{item.sublabel}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
