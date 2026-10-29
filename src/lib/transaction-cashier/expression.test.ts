import { describe, expect, it } from "vitest";
import { expressionFor } from "@/lib/transaction-cashier/expression";

describe("expressionFor", () => {
  it.each([
    ["done", "happy"],
    ["saving", "thinking"],
    ["error", "oops"],
    ["blocked", "oops"],
    ["type", "idle"],
    ["review", "idle"],
  ] as const)("maps %s to %s", (step, expected) => {
    expect(expressionFor(step)).toBe(expected);
  });
});
