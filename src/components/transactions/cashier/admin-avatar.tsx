import { cn } from "@/lib/utils";
import type { CashierExpression } from "@/lib/transaction-cashier/expression";

const INK = "#2b1d12";
const SKIN = "#f1c9a5";

/**
 * Karakter kasir (SVG). Dekoratif — isi percakapan selalu ada di teks bubble —
 * jadi `aria-hidden`. Ganti file ini saja untuk menukar ilustrasi (mis. Rive
 * atau gambar); pemanggil hanya mengirim `expression`.
 */

const EYES: Record<CashierExpression, React.ReactNode> = {
  idle: (
    <>
      <circle cx="50" cy="54" r="2.8" fill={INK} />
      <circle cx="70" cy="54" r="2.8" fill={INK} />
    </>
  ),
  happy: (
    <>
      <path d="M45 55q5-6 10 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M65 55q5-6 10 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
    </>
  ),
  thinking: (
    <>
      <circle cx="52" cy="51" r="2.8" fill={INK} />
      <circle cx="72" cy="51" r="2.8" fill={INK} />
    </>
  ),
  oops: (
    <>
      <circle cx="50" cy="55" r="2.8" fill={INK} />
      <circle cx="70" cy="55" r="2.8" fill={INK} />
      <path d="M44 47l11-3M65 44l11 3" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),
};

const MOUTH: Record<CashierExpression, React.ReactNode> = {
  idle: <path d="M52 66q8 7 16 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />,
  happy: <path d="M49 64q11 14 22 0z" fill="#7a2e2e" stroke={INK} strokeWidth="2" strokeLinejoin="round" />,
  thinking: <circle cx="60" cy="68" r="3.2" fill="none" stroke={INK} strokeWidth="2.2" />,
  oops: <path d="M52 70q8-6 16 0" fill="none" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />,
};

export function AdminAvatar({
  expression = "idle",
  className,
}: Readonly<{ expression?: CashierExpression; className?: string }>) {
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={cn("size-28 shrink-0", className)}>
      <circle cx="60" cy="60" r="58" fill="#f6ecd7" />
      <path d="M20 120C20 92 38 84 60 84s40 8 40 36z" fill={INK} />
      <path d="M40 88h40l4 32H36z" fill="#e8d3a8" />
      <rect x="52" y="74" width="16" height="14" fill={SKIN} />
      <circle cx="60" cy="54" r="26" fill={SKIN} stroke={INK} strokeWidth="2.5" />
      <path d="M34 50C34 24 86 24 86 50 78 39 42 39 34 50z" fill={INK} />
      <circle cx="43" cy="62" r="5" fill="#f19a9a" opacity="0.7" />
      <circle cx="77" cy="62" r="5" fill="#f19a9a" opacity="0.7" />
      {EYES[expression]}
      {MOUTH[expression]}
    </svg>
  );
}
