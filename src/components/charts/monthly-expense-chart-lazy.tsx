"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const MonthlyExpenseChartLazy = dynamic(
  () => import("./monthly-expense-chart").then((m) => m.MonthlyExpenseChart),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> },
);
