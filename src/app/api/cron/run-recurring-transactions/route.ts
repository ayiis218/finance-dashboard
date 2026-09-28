import { NextResponse, type NextRequest } from "next/server";
import { authorizedCron } from "@/lib/cron-auth";
import { runDueRecurringTransactions } from "@/lib/actions/recurring-transactions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runDueRecurringTransactions();

  return NextResponse.json({ ok: true, ...result });
}
