"use client";

import { useEffect, useState } from "react";

/** Jeda setelah langkah baru muncul sebelum tombolnya bisa ditekan. */
export const TAP_GUARD_MS = 350;

/**
 * Mengabaikan klik di dalam `children` selama `delayMs` pertama setelah
 * dipasang. Tap kedua dari double-tap, tap yang terdaftar dua kali, atau Enter
 * yang ditahan di langkah sebelumnya jatuh ke tombol di posisi yang sama pada
 * langkah berikutnya, sehingga tanpa ini bisa memilih nominal cepat atau
 * menjalankan aksi yang tidak dimaksud.
 *
 * Pemasangan ulang per langkah (lewat `key` di pemanggil) me-reset jeda. Klik
 * ditangkap di fase capture, jadi klik dari mouse, sentuhan, keyboard (Enter di
 * tombol), maupun submit implisit form (Enter di kolom teks) ikut tertahan.
 */
export function TapGuard({
  delayMs = TAP_GUARD_MS,
  children,
}: Readonly<{ delayMs?: number; children: React.ReactNode }>) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setArmed(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return (
    <div
      onClickCapture={(event) => {
        if (armed) return;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      {children}
    </div>
  );
}
