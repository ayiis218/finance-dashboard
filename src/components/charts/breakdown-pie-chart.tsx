"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatIDR } from "@/lib/format";
import { hashCategoryColor } from "@/lib/chart-colors";

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

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((d) => (
            <Cell key={d.name} fill={hashCategoryColor(d.name)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const amount = Number(value ?? 0);
            const percent = total > 0 ? (amount / total) * 100 : 0;
            return [`${formatIDR(amount)} (${percent.toFixed(0)}%)`, name];
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
