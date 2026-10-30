import { describe, expect, it } from "vitest";
import { shouldOpenQuickEntry, type ShortcutEvent } from "@/lib/quick-entry-shortcut";

const base: ShortcutEvent = {
  key: "n",
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  repeat: false,
  defaultPrevented: false,
  target: { tagName: "BODY" },
};

describe("shouldOpenQuickEntry", () => {
  it("opens on a plain n press", () => {
    expect(shouldOpenQuickEntry(base, false)).toBe(true);
    expect(shouldOpenQuickEntry({ ...base, key: "N" }, false)).toBe(true);
  });

  it("ignores other keys and modified presses", () => {
    expect(shouldOpenQuickEntry({ ...base, key: "m" }, false)).toBe(false);
    expect(shouldOpenQuickEntry({ ...base, ctrlKey: true }, false)).toBe(false);
    expect(shouldOpenQuickEntry({ ...base, metaKey: true }, false)).toBe(false);
    expect(shouldOpenQuickEntry({ ...base, altKey: true }, false)).toBe(false);
  });

  it("ignores key repeat and already-handled events", () => {
    expect(shouldOpenQuickEntry({ ...base, repeat: true }, false)).toBe(false);
    expect(shouldOpenQuickEntry({ ...base, defaultPrevented: true }, false)).toBe(false);
  });

  it("does not hijack typing in inputs, textareas, selects, or contenteditable", () => {
    for (const tagName of ["INPUT", "TEXTAREA", "SELECT"]) {
      expect(shouldOpenQuickEntry({ ...base, target: { tagName } }, false)).toBe(false);
    }
    expect(shouldOpenQuickEntry({ ...base, target: { tagName: "DIV", isContentEditable: true } }, false)).toBe(false);
  });

  it("does not open over another dialog", () => {
    expect(shouldOpenQuickEntry(base, true)).toBe(false);
  });
});
