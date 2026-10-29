"use client";

import { useReducedMotion } from "motion/react";
import { typingDelayMs } from "@/lib/transaction-cashier/typing-delay";

/** Satu sumber aturan animasi kasir: preferensi reduced-motion dan jeda mengetik. */
export function useChatMotion(savedCount: number) {
  const reduced = useReducedMotion() ?? false;
  return {
    typingDelay: (text: string) => typingDelayMs(text, { reduced, repeatSession: savedCount > 0 }),
  };
}
