"use client";

import { motion } from "motion/react";

/** Bar progres yang terisi dengan pegas saat muncul. `percent` 0–100. */
export function ProgressBar({ percent }: Readonly<{ percent: number }>) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <motion.div
        className="h-full rounded-full bg-primary"
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ type: "spring", stiffness: 70, damping: 18, delay: 0.15 }}
      />
    </div>
  );
}
