import webpush from "web-push";
import { prisma } from "@/lib/prisma";

type PushPayload = { title: string; body: string; url?: string };

let vapidConfigured = false;

/**
 * Lazy, bukan dipanggil di level module — kalau env VAPID belum di-set (mis.
 * belum sempat diisi di Vercel), import file ini saja tidak boleh langsung
 * crash seluruh route yang memakainya. Dicek tiap panggilan `sendPushToAll`
 * alih-alih sekali di top-level.
 */
function ensureVapidConfigured() {
  if (vapidConfigured) return;
  const { VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY } = process.env;
  if (!VAPID_SUBJECT || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    throw new Error(
      "VAPID_SUBJECT/VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY belum di-set — push notification tidak bisa dikirim.",
    );
  }
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  vapidConfigured = true;
}

/**
 * Kirim ke semua device/browser yang subscribe (app single-user, tidak ada
 * scoping per-user — lihat PushSubscription di schema). Subscription yang
 * balas 404/410 (dicabut/kedaluwarsa di sisi browser) otomatis dihapus dari
 * DB — pembersihan standar Web Push, subscription lain tetap lanjut kirim.
 */
export async function sendPushToAll(payload: PushPayload) {
  ensureVapidConfigured();
  const subscriptions = await prisma.pushSubscription.findMany();
  const body = JSON.stringify(payload);

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          body,
        );
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    }),
  );
}
