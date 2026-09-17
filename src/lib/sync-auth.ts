import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/**
 * Gerbang tunggal untuk /api/export/*.
 *
 * Route itu dikecualikan dari matcher di src/proxy.ts karena dipanggil
 * mesin, bukan browser — tanpa pengecualian itu sync job hanya menerima
 * redirect 307 ke halaman login. Konsekuensinya token inilah satu-satunya
 * perlindungannya, dan karena itu ia fail closed: tanpa SYNC_TOKEN,
 * endpoint mati, bukan terbuka.
 *
 * Ada di berkas sendiri supaya dua route memakai pemeriksa yang SAMA. Dua
 * salinan pemeriksa kredensial adalah persis cara satu diperbaiki dan yang
 * lain terlupa.
 */
export function authorizedSync(req: NextRequest): boolean {
  const expected = process.env.SYNC_TOKEN;
  if (!expected) return false;

  const header = req.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return false;

  const provided = Buffer.from(header.slice(7));
  const secret = Buffer.from(expected);
  // Panjang dibandingkan lebih dulu: timingSafeEqual melempar kalau berbeda.
  if (provided.length !== secret.length) return false;

  return timingSafeEqual(provided, secret);
}
