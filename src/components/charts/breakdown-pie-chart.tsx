"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatIDR } from "@/lib/format";
import { assignDistinctColors } from "@/lib/chart-colors";

export function BreakdownPieChart({
  data,
}: Readonly<{
  data: { name: string; value: number }[];
}>) {
  if (data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Belum ada data.
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const colors = assignDistinctColors(data.map((d) => d.name));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <defs>
          {data.map((d, i) => (
            <radialGradient key={d.name} id={`pie-grad-${i}`} cx="35%" cy="35%" r="75%">
              <stop offset="0%" style={{ stopColor: colors.get(d.name) }} stopOpacity={0.6} />
              <stop offset="100%" style={{ stopColor: colors.get(d.name) }} stopOpacity={1} />
            </radialGradient>
          ))}
        </defs>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((d, i) => (
            <Cell key={d.name} fill={`url(#pie-grad-${i})`} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const amount = Number(value ?? 0);
            const percent = total > 0 ? (amount / total) * 100 : 0;
            return [`${formatIDR(amount)} (${percent.toFixed(0)}%)`, name];
          }}
          contentStyle={{
            backgroundColor: "var(--popover)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)",
            fontSize: 12,
          }}
          itemStyle={{ color: "var(--popover-foreground)" }}
          labelStyle={{ color: "var(--popover-foreground)" }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value) => <span style={{ color: "var(--foreground)" }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
