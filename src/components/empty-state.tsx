"use client";

import { motion } from "motion/react";
import { AdminAvatar } from "@/components/transactions/cashier/admin-avatar";
import { TableCell, TableRow } from "@/components/ui/table";

/** Keadaan kosong yang ramah: kasir menyapa dengan pesan singkat, bukan teks datar. */
export function EmptyState({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 0.84, 0.44, 1] }}
      className="flex flex-col items-center gap-2 py-6 text-center"
    >
      <AdminAvatar expression="greeting" className="size-16 sm:size-16" />
      <p className="font-hand text-base text-muted-foreground">{children}</p>
    </motion.div>
  );
}

/** Baris kosong untuk tabel desktop; `colSpan` sebanyak kolom tabelnya. */
export function TableEmptyRow({
  colSpan,
  children,
}: Readonly<{ colSpan: number; children: React.ReactNode }>) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan}>
        <EmptyState>{children}</EmptyState>
      </TableCell>
    </TableRow>
  );
}
