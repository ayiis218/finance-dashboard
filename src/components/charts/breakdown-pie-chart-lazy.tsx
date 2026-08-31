"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const BreakdownPieChartLazy = dynamic(
  () => import("./breakdown-pie-chart").then((m) => m.BreakdownPieChart),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> },
);
