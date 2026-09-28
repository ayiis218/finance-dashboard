import webpush from "web-push";
import { prisma } from "@/lib/prisma";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

type PushPayload = { title: string; body: string; url?: string };

/**
 * Kirim ke semua device/browser yang subscribe (app single-user, tidak ada
 * scoping per-user — lihat PushSubscription di schema). Subscription yang
 * balas 404/410 (dicabut/kedaluwarsa di sisi browser) otomatis dihapus dari
 * DB — pembersihan standar Web Push, subscription lain tetap lanjut kirim.
 */
export async function sendPushToAll(payload: PushPayload) {
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
