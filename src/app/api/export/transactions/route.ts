import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LIMIT = 500;

function authorized(req: NextRequest): boolean {
  const expected = process.env.SYNC_TOKEN;
  if (!expected) return false; // fail closed: tanpa token, endpoint mati
  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;
  const provided = Buffer.from(header.slice(7));
  const secret = Buffer.from(expected);
  if (provided.length !== secret.length) return false;
  return timingSafeEqual(provided, secret);
}

/** Cursor keyset: "<ISO timestamp>|<id>" */
const cursorSchema = z
  .string()
  .transform((v) => {
    const i = v.lastIndexOf("|");
    return { at: new Date(v.slice(0, i)), id: v.slice(i + 1) };
  })
  .refine((c) => !Number.isNaN(c.at.getTime()) && c.id.length > 0, {
    message: "format cursor tidak valid",
  });

const querySchema = z.object({
  txCursor: cursorSchema.optional(),
  delCursor: cursorSchema.optional(),
  limit: z.coerce.number().int().min(1).max(MAX_LIMIT).default(MAX_LIMIT),
});

type Cursor = { at: Date; id: string };

const encode = (c: Cursor) => `${c.at.toISOString()}|${c.id}`;

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const parsed = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "bad_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const { txCursor, delCursor, limit } = parsed.data;

  const [rows, deletedRows] = await Promise.all([
    prisma.transaction.findMany({
      where: txCursor
        ? {
            OR: [
              { updatedAt: { gt: txCursor.at } },
              { updatedAt: txCursor.at, id: { gt: txCursor.id } },
            ],
          }
        : {},
      orderBy: [{ updatedAt: "asc" }, { id: "asc" }],
      take: limit + 1,
      include: {
        account: { select: { name: true } },
        toAccount: { select: { name: true } },
      },
    }),
    prisma.deletedTransaction.findMany({
      where: delCursor
        ? {
            OR: [
              { deletedAt: { gt: delCursor.at } },
              { deletedAt: delCursor.at, id: { gt: delCursor.id } },
            ],
          }
        : {},
      orderBy: [{ deletedAt: "asc" }, { id: "asc" }],
      take: limit + 1,
    }),
  ]);

  const txHasMore = rows.length > limit;
  const txPage = txHasMore ? rows.slice(0, limit) : rows;
  const delHasMore = deletedRows.length > limit;
  const delPage = delHasMore ? deletedRows.slice(0, limit) : deletedRows;

  const lastTx = txPage.at(-1);
  const lastDel = delPage.at(-1);

  return NextResponse.json({
    transactions: txPage.map((t) => ({
      id: t.id,
      type: t.type,
      category: t.category,
      amount: t.amount.toString(), // string: Decimal tidak muat di float JS
      date: t.date.toISOString(),
      note: t.note,
      accountId: t.accountId,
      accountName: t.account.name,
      toAccountId: t.toAccountId,
      toAccountName: t.toAccount?.name ?? null,
      affectsBalance: t.affectsBalance,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    deleted: delPage.map((d) => d.id),
    nextTxCursor: lastTx
      ? encode({ at: lastTx.updatedAt, id: lastTx.id })
      : (txCursor ? encode(txCursor) : null),
    nextDelCursor: lastDel
      ? encode({ at: lastDel.deletedAt, id: lastDel.id })
      : (delCursor ? encode(delCursor) : null),
    hasMore: txHasMore || delHasMore,
    syncedAt: new Date().toISOString(),
  });
}
