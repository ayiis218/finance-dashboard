"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/actions/push";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

type Status = "checking" | "unsupported" | "subscribed" | "unsubscribed";

function isPushSupported() {
  return typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;
}

export function PushNotificationToggle() {
  const [status, setStatus] = useState<Status>(() => (isPushSupported() ? "checking" : "unsupported"));
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isPushSupported()) return;
    navigator.serviceWorker.getRegistration().then(async (registration) => {
      const subscription = await registration?.pushManager.getSubscription();
      setStatus(subscription ? "subscribed" : "unsubscribed");
    });
  }, []);

  const handleSubscribe = () => {
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Izin notifikasi ditolak");
          return;
        }
        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        });
        await subscribeToPush(subscription.toJSON());
        setStatus("subscribed");
        toast.success("Notifikasi aktif");
      } catch {
        toast.error("Gagal mengaktifkan notifikasi");
      }
    });
  };

  const handleUnsubscribe = () => {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        const subscription = await registration?.pushManager.getSubscription();
        if (subscription) {
          await unsubscribeFromPush(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setStatus("unsubscribed");
        toast.success("Notifikasi dimatikan");
      } catch {
        toast.error("Gagal mematikan notifikasi");
      }
    });
  };

  if (status === "unsupported") return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="size-4" />
          Notifikasi
        </CardTitle>
        <CardDescription>
          Dapat pengingat kalau belum ada transaksi tercatat minggu ini. Di iPhone, install dulu
          app ini ke Home Screen sebelum aktifkan notifikasi.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "checking" ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground" />
        ) : status === "subscribed" ? (
          <Button variant="outline" size="sm" onClick={handleUnsubscribe} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <BellOff className="size-4" />}
            Matikan Notifikasi
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubscribe} disabled={isPending}>
            {isPending ? <Loader2 className="size-4 animate-spin" /> : <Bell className="size-4" />}
            Aktifkan Notifikasi
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
