"use client";

import { useSyncExternalStore } from "react";
import { greetingFor } from "@/lib/greeting";

const subscribe = () => () => {};
const clientHour = () => new Date().getHours();
// Server tidak tahu zona waktu pengguna, jadi sapaan netral sampai hydrate.
const serverHour = () => null;

/** Sapaan tulisan tangan sesuai jam di perangkat pengguna. Tidak menampilkan saldo. */
export function Greeting() {
  const hour = useSyncExternalStore(subscribe, clientHour, serverHour);

  return (
    <p className="font-hand flex items-center gap-2 text-xl">
      <span
        aria-hidden="true"
        className="cashier-scene inline-flex size-2 rounded-full bg-[var(--chat-lamp)] cashier-glow"
      />
      {hour === null ? "Halo" : greetingFor(hour)}
    </p>
  );
}
