"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Muncul bertahap (fade + naik tipis). `index` mengatur jeda stagger antar
 * sibling. Durasi/kurva sama dengan animasi kartu yang sudah ada
 * (`SummaryStats`, `MobileRowCard`), reduced-motion ditangani `MotionConfig`
 * di layout.
 */
export function Reveal({
  index = 0,
  className,
  children,
}: Readonly<{ index?: number; className?: string; children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: [0.16, 0.84, 0.44, 1] }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
