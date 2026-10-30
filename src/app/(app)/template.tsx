"use client";

import { motion } from "motion/react";

/**
 * `template.tsx` di-mount ulang tiap navigasi (berbeda dari layout), jadi
 * tiap pindah halaman konten masuk dengan fade + naik tipis. Hanya
 * opacity/transform; tidak menunggu data, jadi tidak bentrok dengan loading.tsx.
 */
export default function AppTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.16, 0.84, 0.44, 1] }}
    >
      {children}
    </motion.div>
  );
}
