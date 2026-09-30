import { NextResponse, type NextRequest } from "next/server";
import { authorizedCron } from "@/lib/cron-auth";
import { getBudgetOverview } from "@/lib/queries/budget";
import { sendPushToAll } from "@/lib/push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALERT_THRESHOLD = 0.9;

export async function GET(req: NextRequest) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const overview = await getBudgetOverview(new Date());
  const overBudget = overview.rows.filter(
    (r) => r.monthlyPlanned > 0 && r.actual >= r.monthlyPlanned * ALERT_THRESHOLD,
  );

  if (overBudget.length > 0) {
    try {
      const summary = overBudget
        .map((r) => `${r.categoryName} (${Math.round((r.actual / r.monthlyPlanned) * 100)}%)`)
        .join(", ");
      await sendPushToAll({
        title: `${overBudget.length} kategori budget mendekati/lewat batas`,
        body: summary,
        url: "/budget",
      });
    } catch (err) {
      return NextResponse.json(
        { ok: false, error: err instanceof Error ? err.message : "Failed to send push" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true, overBudgetCount: overBudget.length });
}
