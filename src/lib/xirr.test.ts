import { describe, expect, it } from "vitest";
import { calculateXIRR } from "@/lib/xirr";

const MS_PER_YEAR = 365.25 * 24 * 3600 * 1000;
const oneYearLater = (d: Date) => new Date(d.getTime() + MS_PER_YEAR);

describe("calculateXIRR", () => {
  it("returns null when fewer than 2 cash flows are given", () => {
    expect(calculateXIRR([])).toBeNull();
    expect(calculateXIRR([{ date: new Date(), amount: 100 }])).toBeNull();
  });

  it("solves a known 10%/year return from a single contribution + single payout", () => {
    const start = new Date("2024-01-01");
    const result = calculateXIRR([
      { date: start, amount: -1_000_000 },
      { date: oneYearLater(start), amount: 1_100_000 },
    ]);
    expect(result).not.toBeNull();
    expect(Math.abs(result! - 0.1)).toBeLessThan(1e-4);
  });

  it("sorts cash flows internally, so input order doesn't change the result", () => {
    const start = new Date("2024-01-01");
    const forward = calculateXIRR([
      { date: start, amount: -1_000_000 },
      { date: oneYearLater(start), amount: 1_100_000 },
    ]);
    const reversed = calculateXIRR([
      { date: oneYearLater(start), amount: 1_100_000 },
      { date: start, amount: -1_000_000 },
    ]);
    expect(reversed).toBeCloseTo(forward!, 9);
  });

  it("returns null for a total-loss cash flow (no rate satisfies the equation)", () => {
    const start = new Date("2024-01-01");
    const result = calculateXIRR([
      { date: start, amount: -1_000_000 },
      { date: oneYearLater(start), amount: 0 },
    ]);
    expect(result).toBeNull();
  });
});
