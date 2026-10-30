import { describe, expect, it } from "vitest";
import { formatIDR } from "@/lib/format";
import { animatableFormatter } from "@/lib/animated-number";

describe("animatableFormatter", () => {
  it("returns exactly the original text at progress 1 for rupiah", () => {
    const text = formatIDR(35_817_148);
    expect(animatableFormatter(text)!(1)).toBe(text);
  });

  it("starts from zero rupiah at progress 0 and keeps the sign", () => {
    const text = `-${formatIDR(5_000)}`;
    const fmt = animatableFormatter(text)!;
    expect(fmt(0)).toBe(`-${formatIDR(0)}`);
    expect(fmt(0.5)).toBe(`-${formatIDR(2_500)}`);
    expect(fmt(1)).toBe(text);
  });

  it("keeps an explicit plus sign on gains", () => {
    const text = `+${formatIDR(1_000_000)}`;
    expect(animatableFormatter(text)!(0.5)).toBe(`+${formatIDR(500_000)}`);
  });

  it("animates plain integers (counts)", () => {
    const fmt = animatableFormatter("66")!;
    expect(fmt(0)).toBe("0");
    expect(fmt(0.5)).toBe("33");
    expect(fmt(1)).toBe("66");
  });

  it("leaves non-numeric / ambiguous text static", () => {
    expect(animatableFormatter("8.6 bulan")).toBeNull();
    expect(animatableFormatter("+12.3%")).toBeNull();
    expect(animatableFormatter("-")).toBeNull();
    expect(animatableFormatter("••••••")).toBeNull();
  });
});
