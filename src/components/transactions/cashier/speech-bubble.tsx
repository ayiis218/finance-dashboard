"use client";

import { useEffect, useState } from "react";

/**
 * Bubble ucapan di atas kepala kasir. Ucapan baru didahului tiga titik selama
 * `typingDelay` ms (0 = langsung tampil, mis. reduced-motion). Wrapper-nya
 * live region supaya screen reader membacakan ucapan yang sudah tampil;
 * `key` memutar ulang animasi masuk tiap isi bubble berganti.
 */
export function SpeechBubble({ text, typingDelay }: Readonly<{ text: string; typingDelay: number }>) {
  const [ready, setReady] = useState(text);

  useEffect(() => {
    if (typingDelay === 0) return;
    const timer = setTimeout(() => setReady(text), typingDelay);
    return () => clearTimeout(timer);
  }, [text, typingDelay]);

  const shown = typingDelay === 0 ? text : ready;
  const typing = shown !== text;

  return (
    <div role="status" aria-live="polite" className="flex min-h-20 w-full max-w-xs items-center justify-center">
      <div
        key={typing ? "typing" : text}
        className="relative rounded-2xl border border-chat-ink/20 bg-chat-bubble px-4 py-3 text-center text-chat-bubble-ink shadow-sm duration-200 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 motion-reduce:animate-none"
      >
        {typing ? (
          <span aria-hidden="true" className="flex h-7 items-center justify-center gap-1.5 px-2">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                style={{ animationDelay: `${delay}ms` }}
                className="size-2 animate-bounce rounded-full bg-chat-bubble-ink/60 motion-reduce:animate-none"
              />
            ))}
          </span>
        ) : (
          <p className="font-hand text-xl leading-snug">{text}</p>
        )}
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b border-chat-ink/20 bg-chat-bubble"
        />
      </div>
    </div>
  );
}
