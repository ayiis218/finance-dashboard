"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

export const NetWorthChartLazy = dynamic(
  () => import("./net-worth-chart").then((m) => m.NetWorthChart),
  { ssr: false, loading: () => <Skeleton className="h-[280px] w-full" /> },
);
