import { describe, expect, it } from "vitest";
import {
  EMPTY_ENTRY,
  amountOf,
  clear,
  entryFromAmount,
  erase,
  pressKey,
  pressPreset,
  selectedPreset,
  type AmountEntry,
} from "@/lib/transaction-cashier/amount-entry";
import { MAX_AMOUNT, QUICK_AMOUNTS } from "@/lib/transaction-cashier/flow";

const type = (keys: string[], from: AmountEntry = EMPTY_ENTRY) => keys.reduce(pressKey, from);

describe("typing digits", () => {
  it("builds the number digit by digit", () => {
    expect(amountOf(type(["2", "5", "0", "0", "0"]))).toBe(25_000);
  });

  it("supports the '000' key as a shortcut for thousands", () => {
    expect(amountOf(type(["2", "5", "000"]))).toBe(25_000);
  });

  it("ignores leading zeros", () => {
    expect(amountOf(type(["0", "0", "7"]))).toBe(7);
    expect(amountOf(type(["000"]))).toBe(0);
  });

  it("stops accepting digits beyond the maximum amount length", () => {
    const entry = type(Array(20).fill("9"));
    expect(amountOf(entry)).toBe(MAX_AMOUNT);
  });
});

describe("quick amounts (regression: typed digits used to stick to the preset)", () => {
  it("selecting a preset sets exactly that amount", () => {
    expect(amountOf(pressPreset(25_000))).toBe(25_000);
  });

  it("the first digit after a preset replaces it instead of appending (25.000 + 5 was 250.005)", () => {
    const entry = type(["5"], pressPreset(25_000));
    expect(amountOf(entry)).toBe(5);
  });

  it("the '000' key after a preset does not turn 25.000 into 25.000.000", () => {
    expect(amountOf(type(["000"], pressPreset(25_000)))).toBe(0);
  });

  it("digits typed after the replacement keep building normally", () => {
    expect(amountOf(type(["7", "5", "0", "0", "0"], pressPreset(25_000)))).toBe(75_000);
  });

  it("picking another preset replaces the previous one", () => {
    expect(amountOf(pressPreset(50_000))).toBe(50_000);
  });

  it("erasing after a preset edits it, and later digits then append to the edited value", () => {
    const edited = erase(pressPreset(25_000));
    expect(amountOf(edited)).toBe(2_500);
    expect(amountOf(pressKey(edited, "5"))).toBe(25_005);
  });

  it("marks the preset as selected only while it is untouched", () => {
    const picked = pressPreset(50_000);
    expect(selectedPreset(picked, QUICK_AMOUNTS)).toBe(50_000);
    expect(selectedPreset(erase(picked), QUICK_AMOUNTS)).toBeNull();
    expect(selectedPreset(type(["5", "0", "0", "0", "0"]), QUICK_AMOUNTS)).toBeNull();
  });

  it("does not mark a prefilled amount that is not a preset", () => {
    expect(selectedPreset(entryFromAmount(37_500), QUICK_AMOUNTS)).toBeNull();
  });
});

describe("prefill from a previous answer", () => {
  it("shows the earlier amount when coming back or editing", () => {
    expect(amountOf(entryFromAmount(37_500))).toBe(37_500);
  });

  it("replaces the earlier amount on the first digit", () => {
    expect(amountOf(type(["9"], entryFromAmount(37_500)))).toBe(9);
  });

  it("starts empty when there is no earlier amount", () => {
    expect(entryFromAmount(undefined)).toEqual(EMPTY_ENTRY);
    expect(entryFromAmount(0)).toEqual(EMPTY_ENTRY);
  });
});

describe("erase and clear", () => {
  it("erase removes the last digit and is safe on an empty entry", () => {
    expect(amountOf(erase(type(["1", "2", "3"])))).toBe(12);
    expect(erase(EMPTY_ENTRY).digits).toBe("");
  });

  it("clear empties everything, including a preset", () => {
    expect(amountOf(clear())).toBe(0);
  });
});
