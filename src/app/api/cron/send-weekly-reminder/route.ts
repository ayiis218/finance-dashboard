import { NextResponse, type NextRequest } from "next/server";
import { endOfWeek, startOfWeek } from "date-fns";
import { authorizedCron } from "@/lib/cron-auth";
import { prisma } from "@/lib/prisma";
import { sendPushToAll } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const range = { gte: startOfWeek(now, { weekStartsOn: 1 }), lte: endOfWeek(now, { weekStartsOn: 1 }) };
  const count = await prisma.transaction.count({ where: { date: range } });

  if (count === 0) {
    try {
      await sendPushToAll({
        title: "Belum ada transaksi minggu ini",
        body: "Yuk catat pengeluaran/pemasukan minggu ini biar datanya lengkap.",
        url: "/transactions",
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Failed to send push" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true, transactionCount: count, notified: count === 0 });
}
