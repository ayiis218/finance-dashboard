import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  ensureCategoryExists: vi.fn(),
  prisma: {
    $transaction: vi.fn(),
    transaction: { findUnique: vi.fn() },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("@/lib/actions/categories", () => ({ ensureCategoryExists: mocks.ensureCategoryExists }));

import { createTransaction } from "@/lib/actions/transactions";

const REQUEST_ID = "3f2c9a10-aaaa-bbbb-cccc-1234567890ab-3";

function form(extra: Record<string, string> = {}): FormData {
  const formData = new FormData();
  const fields = {
    type: "EXPENSE",
    accountId: "bca",
    category: "Kopi",
    amount: "25000",
    date: "2026-11-07",
    affectsBalance: "on",
    ...extra,
  };
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
}

/**
 * Basis data tiruan yang meniru dua perilaku PostgreSQL yang dipakai
 * idempotensi: primary key unik dan rollback seluruh transaction saat gagal.
 */
function fakeDatabase() {
  const rows = new Map<string, Record<string, unknown>>();
  let balance = 0;
  let counter = 0;

  mocks.prisma.$transaction.mockImplementation(async (run: (tx: unknown) => Promise<void>) => {
    const savedRows = new Map(rows);
    const savedBalance = balance;
    const tx = {
      transaction: {
        create: async ({ data }: { data: { id?: string } }) => {
          const id = data.id ?? `auto-${++counter}`;
          if (rows.has(id)) throw new Error("Unique constraint failed on the fields: (`id`)");
          rows.set(id, data);
        },
      },
      bankAccount: {
        update: async ({ data }: { data: { balance: { increment: number } } }) => {
          balance += data.balance.increment;
        },
      },
    };
    try {
      await run(tx);
    } catch (error) {
      rows.clear();
      savedRows.forEach((v, k) => rows.set(k, v));
      balance = savedBalance;
      throw error;
    }
  });
  mocks.prisma.transaction.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) =>
    rows.has(where.id) ? { id: where.id } : null,
  );

  return { rows, balance: () => balance };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("createTransaction idempotency", () => {
  it("stores the client request id as the transaction id", async () => {
    const db = fakeDatabase();
    await createTransaction(form({ id: REQUEST_ID }));
    expect([...db.rows.keys()]).toEqual([REQUEST_ID]);
  });

  it("records a retried request only once and changes the balance only once", async () => {
    const db = fakeDatabase();
    await createTransaction(form({ id: REQUEST_ID }));
    await createTransaction(form({ id: REQUEST_ID })); // klien mengulang karena respons pertama hilang

    expect(db.rows.size).toBe(1);
    expect(db.balance()).toBe(-25_000);
  });

  it("still refreshes the pages when the request turns out to be a retry", async () => {
    fakeDatabase();
    await createTransaction(form({ id: REQUEST_ID }));
    mocks.revalidatePath.mockClear();
    await createTransaction(form({ id: REQUEST_ID }));
    expect(mocks.revalidatePath.mock.calls.map(([path]) => path)).toEqual(["/transactions", "/accounts", "/"]);
  });

  it("records different request ids as separate transactions", async () => {
    const db = fakeDatabase();
    await createTransaction(form({ id: `${REQUEST_ID}a` }));
    await createTransaction(form({ id: `${REQUEST_ID}b` }));
    expect(db.rows.size).toBe(2);
    expect(db.balance()).toBe(-50_000);
  });

  it("keeps the old behaviour without an id: every submission is its own transaction", async () => {
    const db = fakeDatabase();
    await createTransaction(form());
    await createTransaction(form());
    expect(db.rows.size).toBe(2);
    expect(mocks.prisma.transaction.findUnique).not.toHaveBeenCalled();
  });

  it("surfaces a real failure when no row with that id exists", async () => {
    mocks.prisma.$transaction.mockRejectedValue(new Error("connection lost"));
    mocks.prisma.transaction.findUnique.mockResolvedValue(null);
    await expect(createTransaction(form({ id: REQUEST_ID }))).rejects.toThrow("connection lost");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it.each(["short", "has space in it!!", "x".repeat(65)])("rejects the malformed request id %j before touching the database", async (id) => {
    await expect(createTransaction(form({ id }))).rejects.toThrow();
    expect(mocks.prisma.$transaction).not.toHaveBeenCalled();
  });
});
