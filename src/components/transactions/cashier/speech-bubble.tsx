/**
 * Bubble ucapan di atas kepala kasir. Wrapper-nya live region supaya screen
 * reader membacakan ucapan baru; `key={text}` memutar ulang animasi masuk tiap
 * ucapan berganti (dimatikan saat reduced-motion).
 */
export function SpeechBubble({ text }: Readonly<{ text: string }>) {
  return (
    <div role="status" aria-live="polite" className="flex min-h-20 w-full max-w-xs items-center justify-center">
      <div
        key={text}
        className="relative rounded-2xl border bg-card px-4 py-3 text-center shadow-sm duration-200 animate-in fade-in zoom-in-95 slide-in-from-bottom-1 motion-reduce:animate-none"
      >
        <p className="font-hand text-xl leading-snug text-card-foreground">{text}</p>
        <span
          aria-hidden="true"
          className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 border-r border-b bg-card"
        />
      </div>
    </div>
  );
}
