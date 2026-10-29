import { describe, expect, it } from "vitest";
import { MAX_TYPING_MS, MIN_TYPING_MS, typingDelayMs } from "@/lib/transaction-cashier/typing-delay";

const NORMAL = { reduced: false, repeatSession: false };

describe("typingDelayMs", () => {
  it("grows with text length but never below the minimum", () => {
    expect(typingDelayMs("", NORMAL)).toBe(MIN_TYPING_MS);
    expect(typingDelayMs("Berapa totalnya?", NORMAL)).toBeGreaterThan(MIN_TYPING_MS);
  });

  it("is capped so a long line never makes the user wait", () => {
    expect(typingDelayMs("x".repeat(500), NORMAL)).toBe(MAX_TYPING_MS);
  });

  it("is zero for reduced motion and for repeat transactions", () => {
    expect(typingDelayMs("Halo!", { reduced: true, repeatSession: false })).toBe(0);
    expect(typingDelayMs("Halo!", { reduced: false, repeatSession: true })).toBe(0);
  });
});
