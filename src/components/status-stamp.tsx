"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Cap status inline ala buku besar: menghantam dari besar ke ukuran asli lalu
 * sedikit miring. Warna mengikuti token `--positive` (status tidak di-restyle).
 * Teks tetap terbaca screen reader; gerakan dimatikan oleh `MotionConfig`
 * (reduced motion) di layout.
 */
export function StatusStamp({
  children,
  className,
  ...rest
}: Readonly<
  Omit<
    React.ComponentProps<typeof motion.span>,
    "initial" | "animate" | "transition" | "children"
  > & { children: React.ReactNode }
>) {
  return (
    <motion.span
      initial={{ scale: 1.8, opacity: 0, rotate: -14 }}
      animate={{ scale: 1, opacity: 1, rotate: -4 }}
      transition={{ type: "spring", stiffness: 460, damping: 20 }}
      className={cn(
        "inline-flex items-center rounded-md border-2 border-double border-positive px-2 py-0.5 font-hand text-sm leading-none tracking-wide text-positive uppercase",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.span>
  );
}
