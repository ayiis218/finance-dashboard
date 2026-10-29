import { cn } from "@/lib/utils";

/**
 * Suasana kedai di belakang kasir: dinding, lampu gantung yang berpendar,
 * papan menu, dan meja kayu di depan. Urutan lapisan: latar (z -10) → anak
 * (kasir + bubble) → meja (z 10) yang menimpa bagian bawah kasir.
 * Warna dari token `--chat-*` (terang = siang, gelap = malam).
 */

function Backdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 -z-10 size-full"
    >
      <defs>
        <radialGradient id="cashier-lamp-glow">
          <stop offset="0%" stopColor="var(--chat-lamp)" stopOpacity="0.9" />
          <stop offset="100%" stopColor="var(--chat-lamp)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="var(--chat-wall)" />
      <rect y="150" width="400" height="70" fill="var(--chat-wall-shade)" />
      {[90, 310].map((x) => (
        <g key={x}>
          <circle className="cashier-glow" cx={x} cy="52" r="52" fill="url(#cashier-lamp-glow)" />
          <line x1={x} y1="0" x2={x} y2="30" stroke="var(--chat-ink)" strokeWidth="2" />
          <path d={`M${x - 20} 48L${x - 9} 30h18l11 18z`} fill="var(--chat-wood-dark)" />
          <ellipse cx={x} cy="48" rx="20" ry="3" fill="var(--chat-lamp)" />
        </g>
      ))}
      <g>
        <rect x="150" y="62" width="100" height="62" rx="3" fill="#2b1d12" stroke="var(--chat-wood)" strokeWidth="4" />
        <text
          x="200"
          y="84"
          textAnchor="middle"
          fontSize="16"
          fill="#f6e8cf"
          style={{ fontFamily: "var(--font-patrick-hand), cursive" }}
        >
          MENU
        </text>
        {[96, 106, 116].map((y) => (
          <line key={y} x1="166" y1={y} x2="234" y2={y} stroke="#f6e8cf" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="14 4" />
        ))}
      </g>
    </svg>
  );
}

function Counter() {
  return (
    <div className="relative z-10 -mt-5 h-9 w-full border-t-4 border-chat-wood-dark bg-chat-wood">
      <svg aria-hidden="true" viewBox="0 0 120 36" className="absolute -top-8 right-5 h-9 w-[7.5rem]">
        <rect x="64" y="14" width="40" height="22" rx="2" fill="#2b1d12" />
        <rect x="70" y="8" width="28" height="12" rx="1.5" fill="#cfe3d4" stroke="#2b1d12" strokeWidth="2" />
        <path d="M12 36V22h18v14z" fill="#fffaf0" stroke="#2b1d12" strokeWidth="2" />
        <path d="M30 25h5v6h-5" fill="none" stroke="#2b1d12" strokeWidth="2" />
      </svg>
    </div>
  );
}

export function KedaiScene({ className, children }: Readonly<{ className?: string; children: React.ReactNode }>) {
  return (
    <div className={cn("relative isolate flex flex-col items-center overflow-hidden", className)}>
      <Backdrop />
      {children}
      <Counter />
    </div>
  );
}
