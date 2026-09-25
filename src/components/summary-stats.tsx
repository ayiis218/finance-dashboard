"use client";

import { motion } from "motion/react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type SummaryStatItem = {
  label: string;
  value: string;
  description?: string;
  sublabel?: string;
  tone?: "default" | "positive" | "negative" | "highlight";
};

export function SummaryStats({
  items,
  compact = false,
}: Readonly<{ items: SummaryStatItem[]; compact?: boolean }>) {
  if (compact) {
    return (
      <div className="flex flex-col divide-y rounded-lg border bg-card sm:flex-row sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex flex-1 items-center justify-between gap-3 px-4 py-2.5 sm:flex-col sm:items-start sm:justify-start">
            <span className="text-xs text-muted-foreground">{item.label}</span>
            <span
              className={cn(
                "text-sm font-semibold sm:text-base",
                item.tone === "positive" && "text-positive",
                item.tone === "negative" && "text-destructive",
              )}
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          className="w-full"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.05, ease: [0.16, 0.84, 0.44, 1] }}
        >
          <Card
            className={cn(
              "h-full transition-shadow hover:shadow-md",
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
                  item.tone === "positive" && "text-positive",
                  item.tone === "negative" && "text-destructive",
                )}
              >
                {item.value}
              </p>
              {item.sublabel && (
                <p className="mt-1 text-xs text-muted-foreground">{item.sublabel}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
