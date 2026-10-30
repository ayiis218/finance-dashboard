"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";
import { animatableFormatter } from "@/lib/animated-number";

const DURATION_S = 0.9;

/**
 * Teks angka yang "berputar naik" dari nol seperti mesin kasir saat pertama
 * tampil/berubah. Render awal (SSR & hydration) SELALU nilai final — animasi
 * cuma menulis ke DOM sesudah mount, dan berakhir persis di `text` asli. Teks
 * yang tidak aman dianimasikan (persen, topeng privacy, "-") atau
 * reduced-motion → statis.
 */
export function AnimatedNumber({ text, className }: Readonly<{ text: string; className?: string }>) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    const format = animatableFormatter(text);
    if (!node || !format || reduced) return;

    const controls = animate(0, 1, {
      duration: DURATION_S,
      ease: [0.16, 0.84, 0.44, 1],
      onUpdate: (progress) => {
        node.textContent = format(progress);
      },
      onComplete: () => {
        node.textContent = text;
      },
    });
    return () => {
      controls.stop();
      node.textContent = text;
    };
  }, [text, reduced]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
