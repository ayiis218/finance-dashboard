"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function MobileCardList({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return <div className={cn("space-y-3 sm:hidden", className)}>{children}</div>;
}

export function MobileRowCard({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 0.84, 0.44, 1] }}
      className={cn("space-y-2 rounded-lg border p-3 text-sm", className)}
    >
      {children}
    </motion.div>
  );
}

export function MobileRowHeader({
  title,
  action,
  className,
}: Readonly<{ title: React.ReactNode; action?: React.ReactNode; className?: string }>) {
  return (
    <div className={cn("flex items-start justify-between gap-3", className)}>
      <div className="min-w-0 font-medium">{title}</div>
      {action}
    </div>
  );
}

export function MobileRowField({
  label,
  value,
  valueClassName,
}: Readonly<{ label: string; value: React.ReactNode; valueClassName?: string }>) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("text-right", valueClassName)}>{value}</span>
    </div>
  );
}

export function MobileRowActions({
  className,
  children,
}: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={cn("flex items-center justify-end gap-1 border-t pt-2", className)}>
      {children}
    </div>
  );
}

export function MobileEmptyState({ children }: Readonly<{ children: React.ReactNode }>) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
