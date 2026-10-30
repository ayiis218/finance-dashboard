import { describe, expect, it, vi } from "vitest";
import { writeOnce } from "@/lib/write-once";

describe("writeOnce", () => {
  it("does not check for an existing record when the write succeeds", async () => {
    const alreadyRecorded = vi.fn();
    await writeOnce(async () => {}, alreadyRecorded);
    expect(alreadyRecorded).not.toHaveBeenCalled();
  });

  it("treats a failed write as done when the record already exists (retry)", async () => {
    await expect(
      writeOnce(
        async () => {
          throw new Error("unique constraint");
        },
        async () => true,
      ),
    ).resolves.toBeUndefined();
  });

  it("rethrows the original error when nothing was recorded", async () => {
    const original = new Error("db down");
    await expect(
      writeOnce(
        async () => {
          throw original;
        },
        async () => false,
      ),
    ).rejects.toBe(original);
  });

  it("rethrows the original error, not the check's error, when the check itself fails", async () => {
    const original = new Error("write failed");
    await expect(
      writeOnce(
        async () => {
          throw original;
        },
        async () => {
          throw new Error("check failed");
        },
      ),
    ).rejects.toBe(original);
  });
});
