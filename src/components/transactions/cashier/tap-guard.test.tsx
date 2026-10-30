// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TAP_GUARD_MS, TapGuard } from "@/components/transactions/cashier/tap-guard";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const settle = () => act(() => void vi.advanceTimersByTime(TAP_GUARD_MS));

describe("TapGuard", () => {
  it("ignores a click that arrives right after the step appears (double-tap carry-over)", () => {
    const onClick = vi.fn();
    render(
      <TapGuard>
        <button onClick={onClick}>Rp 25.000</button>
      </TapGuard>,
    );
    fireEvent.click(screen.getByText("Rp 25.000"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("lets clicks through once the delay has passed", () => {
    const onClick = vi.fn();
    render(
      <TapGuard>
        <button onClick={onClick}>Pengeluaran</button>
      </TapGuard>,
    );
    settle();
    fireEvent.click(screen.getByText("Pengeluaran"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("still blocks just before the delay ends", () => {
    const onClick = vi.fn();
    render(
      <TapGuard>
        <button onClick={onClick}>Ok</button>
      </TapGuard>,
    );
    act(() => void vi.advanceTimersByTime(TAP_GUARD_MS - 1));
    fireEvent.click(screen.getByText("Ok"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("also blocks the implicit form submit that Enter triggers through the submit button", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <TapGuard>
        <form onSubmit={onSubmit}>
          <input aria-label="Catatan" />
          <button type="submit">Simpan catatan</button>
        </form>
      </TapGuard>,
    );
    fireEvent.click(screen.getByText("Simpan catatan"));
    expect(onSubmit).not.toHaveBeenCalled();

    settle();
    fireEvent.click(screen.getByText("Simpan catatan"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("starts the delay over when a new step replaces the old one (remount by key)", () => {
    const onClick = vi.fn();
    const view = (step: string) => (
      <TapGuard key={step}>
        <button onClick={onClick}>Pilih</button>
      </TapGuard>
    );
    const { rerender } = render(view("kategori"));
    settle();
    rerender(view("jumlah"));
    fireEvent.click(screen.getByText("Pilih"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
