"use client";

import { MotionConfig } from "motion/react";

/** Satu titik kebijakan reduced-motion untuk seluruh animasi motion di dalam app. */
export function MotionProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
