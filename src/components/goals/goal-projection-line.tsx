import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { GoalProjection } from "@/lib/goal-projection";

export function GoalProjectionLine({ projection }: Readonly<{ projection: GoalProjection }>) {
  if (projection.status === "achieved") {
    return <p className="text-xs text-positive">Target tercapai 🎉</p>;
  }

  if (projection.status === "no-data") {
    return <p className="text-xs text-muted-foreground">Belum cukup data untuk proyeksi</p>;
  }

  const label = projection.status === "on-track" ? "sesuai jadwal" : "meleset dari target";

  return (
    <p
      className={cn(
        "text-xs",
        projection.status === "on-track" ? "text-positive" : "text-destructive",
      )}
    >
      Proyeksi tercapai {format(projection.projectedDate!, "MMM yyyy")} — {label}
    </p>
  );
}
