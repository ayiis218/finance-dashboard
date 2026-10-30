import { describe, expect, it } from "vitest";
import { greetingFor } from "@/lib/greeting";

describe("greetingFor", () => {
  it.each([
    [4, "Selamat pagi"],
    [10, "Selamat pagi"],
    [11, "Selamat siang"],
    [14, "Selamat siang"],
    [15, "Selamat sore"],
    [17, "Selamat sore"],
    [18, "Selamat malam"],
    [23, "Selamat malam"],
    [0, "Selamat malam"],
    [3, "Selamat malam"],
  ])("jam %i → %s", (hour, expected) => {
    expect(greetingFor(hour)).toBe(expected);
  });
});
