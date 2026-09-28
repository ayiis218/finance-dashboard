"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const subscriptionSchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export async function subscribeToPush(subscription: unknown) {
  const data = subscriptionSchema.parse(subscription);
  await prisma.pushSubscription.upsert({
    where: { endpoint: data.endpoint },
    create: { endpoint: data.endpoint, p256dh: data.keys.p256dh, auth: data.keys.auth },
    update: { p256dh: data.keys.p256dh, auth: data.keys.auth },
  });
}

export async function unsubscribeFromPush(endpoint: string) {
  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
}
