"use client";

import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { formatIDR } from "@/lib/format";

function formatCompact(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

export function NetWorthChart({
  data,
}: Readonly<{ data: { date: Date; netWorth: number }[] }>) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Belum ada snapshot net worth.
      </div>
    );
  }

  const chartData = data.map((d) => ({ month: format(d.date, "MMM yy"), netWorth: d.netWorth }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={formatCompact}
          width={48}
          tick={{ fill: "var(--muted-foreground)" }}
        />
        <Tooltip
          formatter={(value) => [formatIDR(Number(value ?? 0)), "Net Worth"]}
          contentStyle={{
            backgroundColor: "var(--popover)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
          itemStyle={{ color: "var(--popover-foreground)" }}
          labelStyle={{ color: "var(--popover-foreground)" }}
        />
        <Line type="monotone" dataKey="netWorth" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
