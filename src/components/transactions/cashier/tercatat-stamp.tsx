"use client";

import { motion } from "motion/react";

/** Cap "TERCATAT" yang menghantam meja saat transaksi tersimpan. Dekoratif; teks "Beres, tercatat!" ada di bubble. */
export function TercatatStamp() {
  return (
    <motion.div
      aria-hidden="true"
      initial={{ scale: 2.4, opacity: 0, rotate: -22 }}
      animate={{ scale: 1, opacity: 1, rotate: -8 }}
      transition={{ type: "spring", stiffness: 420, damping: 22 }}
      className="pointer-events-none absolute bottom-1 left-4 z-20 rounded-md border-4 border-double border-positive px-3 py-0.5 font-hand text-2xl tracking-wide text-positive"
    >
      TERCATAT
    </motion.div>
  );
}
