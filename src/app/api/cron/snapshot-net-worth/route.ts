import { NextResponse, type NextRequest } from "next/server";
import { authorizedCron } from "@/lib/cron-auth";
import { captureNetWorthSnapshot } from "@/lib/queries/dashboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!authorizedCron(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await captureNetWorthSnapshot();

  return NextResponse.json({ ok: true, capturedAt: new Date().toISOString() });
}
