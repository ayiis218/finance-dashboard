import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionId, requestIdFor } from "@/lib/transaction-cashier/request-id";
import { REQUEST_ID_PATTERN } from "@/lib/write-once";

afterEach(() => vi.unstubAllGlobals());

describe("createSessionId", () => {
  it("returns a different id each time", () => {
    expect(createSessionId()).not.toBe(createSessionId());
  });

  it("falls back to getRandomValues when randomUUID is unavailable (non-secure context)", () => {
    vi.stubGlobal("crypto", { getRandomValues: (a: Uint8Array) => a.fill(171) });
    expect(createSessionId()).toBe("ab".repeat(16));
  });

  it("still returns an id when no crypto exists at all", () => {
    vi.stubGlobal("crypto", undefined);
    expect(createSessionId()).toMatch(/^[0-9a-f]{32}$/);
  });
});

describe("requestIdFor", () => {
  it("is stable for the same revision and differs across revisions", () => {
    expect(requestIdFor("abc", 3)).toBe(requestIdFor("abc", 3));
    expect(requestIdFor("abc", 3)).not.toBe(requestIdFor("abc", 4));
  });

  it("stays within the format and length the server accepts, even for a long session", () => {
    const id = requestIdFor(createSessionId(), 99_999);
    expect(id).toMatch(REQUEST_ID_PATTERN);
  });
});
