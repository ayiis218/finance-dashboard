import { describe, expect, it } from "vitest";
import { expressionFor } from "@/lib/transaction-cashier/expression";
import type { ChatState } from "@/lib/transaction-cashier/flow";

function state(overrides: Partial<ChatState>): ChatState {
  return { step: "type", draft: {}, history: [], returnToReview: false, savedCount: 0, ...overrides };
}

describe("expressionFor", () => {
  it("greets on the very first question", () => {
    expect(expressionFor(state({}))).toBe("greeting");
  });

  it("is idle on the first question after a transaction was already saved", () => {
    expect(expressionFor(state({ savedCount: 1 }))).toBe("idle");
  });

  it("is idle on the first question after the user went back with an answered type", () => {
    expect(expressionFor(state({ draft: { type: "EXPENSE" } }))).toBe("idle");
  });

  it("is confused when no account exists", () => {
    expect(expressionFor(state({ step: "blocked" }))).toBe("confused");
  });

  it.each([
    ["saving", "thinking"],
    ["done", "happy"],
    ["error", "oops"],
    ["category", "idle"],
    ["review", "idle"],
  ] as const)("maps %s to %s", (step, expected) => {
    expect(expressionFor(state({ step }))).toBe(expected);
  });
});
