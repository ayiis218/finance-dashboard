import { describe, expect, it } from "vitest";
import { addMonths, subMonths } from "date-fns";
import { getGoalProjection } from "@/lib/goal-projection";

describe("getGoalProjection", () => {
  it("reports achieved when total saved already covers the target", () => {
    const result = getGoalProjection({
      targetAmount: 1_000_000,
      tenorMonths: 12,
      startDate: subMonths(new Date(), 3),
      entries: [{ amount: 1_500_000, month: subMonths(new Date(), 1) }],
    });
    expect(result.status).toBe("achieved");
    expect(result.projectedDate).toBeNull();
  });

  it("reports no-data when startDate is in the future (regression)", () => {
    const start = subMonths(new Date(), -1); // 1 bulan ke depan
    const result = getGoalProjection({
      targetAmount: 50_000_000,
      tenorMonths: 12,
      startDate: start,
      entries: [],
    });
    expect(result.status).toBe("no-data");
  });

  it("ignores entries logged before startDate when computing the rate (regression)", () => {
    const start = subMonths(new Date(), 2);
    const result = getGoalProjection({
      targetAmount: 50_000_000,
      tenorMonths: 24,
      startDate: start,
      // Entry ini 5 bulan lalu — sebelum startDate (2 bulan lalu) — harus diabaikan.
      entries: [{ amount: 10_000_000, month: subMonths(new Date(), 5) }],
    });
    expect(result.status).toBe("no-data");
    expect(result.monthlyRate).toBe(0);
  });

  it("reports no-data when there are no contributions at all since start", () => {
    const result = getGoalProjection({
      targetAmount: 10_000_000,
      tenorMonths: 12,
      startDate: subMonths(new Date(), 3),
      entries: [],
    });
    expect(result.status).toBe("no-data");
  });

  it("reports on-track when the projected date lands before the deadline", () => {
    const start = subMonths(new Date(), 5);
    const result = getGoalProjection({
      targetAmount: 20_000_000,
      tenorMonths: 24,
      startDate: start,
      entries: [
        { amount: 1_000_000, month: subMonths(new Date(), 4) },
        { amount: 1_000_000, month: subMonths(new Date(), 3) },
        { amount: 1_000_000, month: subMonths(new Date(), 2) },
        { amount: 1_000_000, month: subMonths(new Date(), 1) },
        { amount: 1_000_000, month: new Date() },
      ],
    });
    expect(result.status).toBe("on-track");
  });

  it("reports behind when the projected date lands after the deadline", () => {
    const start = subMonths(new Date(), 5);
    const result = getGoalProjection({
      targetAmount: 20_000_000,
      tenorMonths: 10, // deadline jauh lebih dekat dari skenario on-track di atas
      startDate: start,
      entries: [
        { amount: 1_000_000, month: subMonths(new Date(), 4) },
        { amount: 1_000_000, month: subMonths(new Date(), 3) },
        { amount: 1_000_000, month: subMonths(new Date(), 2) },
        { amount: 1_000_000, month: subMonths(new Date(), 1) },
        { amount: 1_000_000, month: new Date() },
      ],
    });
    expect(result.status).toBe("behind");
  });

  it("treats a projection landing exactly on the deadline as on-track (inclusive boundary)", () => {
    const start = subMonths(new Date(), 1);
    const result = getGoalProjection({
      targetAmount: 12_000_000,
      tenorMonths: 12,
      startDate: start,
      entries: [{ amount: 1_000_000, month: start }],
    });
    expect(result.status).toBe("on-track");
    const deadline = addMonths(start, 12);
    expect(result.projectedDate?.getTime()).toBe(deadline.getTime());
  });
});
