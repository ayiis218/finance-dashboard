import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Gerbang untuk /api/cron/*, mirror `authorizedSync` di sync-auth.ts.
 *
 * Route ini dikecualikan dari matcher di src/proxy.ts karena dipanggil
 * Vercel Cron, bukan browser — tanpa pengecualian itu tiap trigger cuma
 * kena redirect 307 ke halaman login. Token inilah satu-satunya
 * perlindungannya, jadi fail closed: tanpa CRON_SECRET, endpoint mati,
 * bukan terbuka.
 */
export function authorizedCron(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;

  const provided = Buffer.from(header.slice(7));
  const secret = Buffer.from(expected);
  if (provided.length !== secret.length) return false;

  return timingSafeEqual(provided, secret);
}
