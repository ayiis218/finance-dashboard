"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatCompact(value: number) {
  return new Intl.NumberFormat("id-ID", {
    notation: "compact",
    compactDisplay: "short",
  }).format(value);
}

export function MonthlyExpenseChart({
  data,
}: Readonly<{
  data: { month: string; total: number }[];
}>) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <defs>
          <linearGradient id="expenseBarGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          fontSize={12}
          tickFormatter={formatCompact}
          width={48}
        />
        <Tooltip
          formatter={(value) => [
            new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumFractionDigits: 0,
            }).format(Number(value ?? 0)),
            "Pengeluaran",
          ]}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar dataKey="total" fill="url(#expenseBarGradient)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
