// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AmountKeypad } from "@/components/transactions/cashier/amount-keypad";

afterEach(cleanup);

const display = () => document.querySelector("output")!.textContent!.replace(/\s/g, " ");
const tap = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const digit = (key: string) => tap(new RegExp(`^${key}$`));
// Anchored: "Rp 250.000" must not match "50.000". `\s` also covers the non-breaking space Intl puts after "Rp".
const rp = (amount: string) => new RegExp(`^Rp\\s${amount.replace(/\./g, "\\.")}$`);

function setup(initialAmount?: number) {
  const onSubmit = vi.fn();
  render(<AmountKeypad initialAmount={initialAmount} onSubmit={onSubmit} />);
  return onSubmit;
}

describe("AmountKeypad quick amounts", () => {
  it("shows the chosen quick amount and marks it as selected", () => {
    setup();
    tap(rp("25.000"));
    expect(display()).toMatch(rp("25.000"));
    expect(screen.getByRole("button", { name: rp("25.000") }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: rp("50.000") }).getAttribute("aria-pressed")).toBe("false");
  });

  it("submits exactly the quick amount that was chosen", () => {
    const onSubmit = setup();
    tap(rp("100.000"));
    tap("Lanjut");
    expect(onSubmit).toHaveBeenCalledWith(100_000);
  });

  it("replaces the quick amount with the first digit typed instead of appending (was 25.000 -> 250.005)", () => {
    const onSubmit = setup();
    tap(rp("25.000"));
    digit("5");
    tap("Lanjut");
    expect(onSubmit).toHaveBeenCalledWith(5);
  });

  it("does not multiply a quick amount by 1000 when '000' is pressed", () => {
    setup();
    tap(rp("25.000"));
    digit("000");
    expect(display()).toMatch(/\b0$/);
  });

  it("unmarks the quick amount once it is edited", () => {
    setup();
    tap(rp("25.000"));
    tap("Hapus angka terakhir");
    expect(screen.getByRole("button", { name: rp("25.000") }).getAttribute("aria-pressed")).toBe("false");
  });

  it("types a custom amount with digits and the '000' key", () => {
    const onSubmit = setup();
    digit("3");
    digit("7");
    digit("000");
    tap("Lanjut");
    expect(onSubmit).toHaveBeenCalledWith(37_000);
  });
});

describe("AmountKeypad clear and prefill", () => {
  it("clears the whole amount and disables 'Lanjut' again", () => {
    setup();
    tap(rp("50.000"));
    tap("Bersihkan jumlah");
    expect(display()).toMatch(/\b0$/);
    expect((screen.getByRole("button", { name: "Lanjut" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables 'Bersihkan' while the amount is empty", () => {
    setup();
    expect((screen.getByRole("button", { name: "Bersihkan jumlah" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("starts from the earlier answer when coming back, instead of an empty keypad", () => {
    const onSubmit = setup(37_500);
    expect(display()).toMatch(/37\.500/);
    tap("Lanjut");
    expect(onSubmit).toHaveBeenCalledWith(37_500);
  });

  it("replaces the earlier answer when a digit is typed", () => {
    const onSubmit = setup(37_500);
    digit("9");
    tap("Lanjut");
    expect(onSubmit).toHaveBeenCalledWith(9);
  });
});

describe("AmountKeypad physical keyboard", () => {
  it("focuses the keypad so typing works right away", () => {
    setup();
    expect(document.activeElement).toBe(screen.getByRole("group", { name: "Keypad jumlah" }));
  });

  it("types digits and submits with Enter", () => {
    const onSubmit = setup();
    const keypad = screen.getByRole("group", { name: "Keypad jumlah" });
    for (const key of ["1", "2", "5", "0", "0", "0"]) fireEvent.keyDown(keypad, { key });
    fireEvent.keyDown(keypad, { key: "Enter" });
    expect(onSubmit).toHaveBeenCalledWith(125_000);
  });

  it("does not type when a browser shortcut (Ctrl/Cmd + digit) is pressed", () => {
    setup();
    const keypad = screen.getByRole("group", { name: "Keypad jumlah" });
    fireEvent.keyDown(keypad, { key: "1", ctrlKey: true });
    fireEvent.keyDown(keypad, { key: "2", metaKey: true });
    expect(display()).toMatch(/\b0$/);
  });
});
