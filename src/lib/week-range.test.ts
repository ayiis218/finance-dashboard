import { describe, expect, it } from "vitest";
import { getWeekRange } from "@/lib/week-range";

// Januari 2026 (31 hari) dan Februari 2026 (28 hari, bukan tahun kabisat).
const JAN_2026 = new Date(2026, 0, 15);
const FEB_2026 = new Date(2026, 1, 15);

describe("getWeekRange", () => {
  it("returns the whole month when no week is given", () => {
    const { from, to } = getWeekRange(JAN_2026);
    expect(from.getDate()).toBe(1);
    expect(to.getDate()).toBe(31);
  });

  it("buckets week 1 as day 1-7", () => {
    const { from, to } = getWeekRange(JAN_2026, 1);
    expect(from.getDate()).toBe(1);
    expect(to.getDate()).toBe(7);
  });

  it("buckets week 2 as day 8-14", () => {
    const { from, to } = getWeekRange(JAN_2026, 2);
    expect(from.getDate()).toBe(8);
    expect(to.getDate()).toBe(14);
  });

  it("buckets week 3 as day 15-21", () => {
    const { from, to } = getWeekRange(JAN_2026, 3);
    expect(from.getDate()).toBe(15);
    expect(to.getDate()).toBe(21);
  });

  it("absorbs the remaining days of a 31-day month into week 4 (22-31)", () => {
    const { from, to } = getWeekRange(JAN_2026, 4);
    expect(from.getDate()).toBe(22);
    expect(to.getDate()).toBe(31);
  });

  it("absorbs the remaining days of a 28-day month into week 4 (22-28)", () => {
    const { from, to } = getWeekRange(FEB_2026, 4);
    expect(from.getDate()).toBe(22);
    expect(to.getDate()).toBe(28);
  });
});
