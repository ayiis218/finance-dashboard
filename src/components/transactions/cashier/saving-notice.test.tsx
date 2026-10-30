// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SLOW_SAVE_MS, SavingNotice } from "@/components/transactions/cashier/saving-notice";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("SavingNotice", () => {
  it("says it is saving, without the slow warning at first", () => {
    render(<SavingNotice />);
    expect(screen.getByText("Menyimpan…")).toBeTruthy();
    expect(screen.queryByText(/tidak perlu menyimpan ulang/)).toBeNull();
  });

  it("warns not to save again once saving takes too long", () => {
    render(<SavingNotice />);
    act(() => void vi.advanceTimersByTime(SLOW_SAVE_MS));
    expect(screen.getByText(/tidak perlu menyimpan ulang/)).toBeTruthy();
  });

  it("announces itself as a status so screen readers hear the slow warning", () => {
    render(<SavingNotice />);
    expect(screen.getByRole("status")).toBeTruthy();
  });
});
