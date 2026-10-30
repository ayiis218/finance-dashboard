import type { CSSProperties } from "react";

/** Tooltip chart bergaya struk: kertas popover, garis putus-putus, angka mono. */
export const receiptTooltipProps = {
  contentStyle: {
    backgroundColor: "var(--popover)",
    border: "1px dashed var(--border)",
    borderRadius: "var(--radius)",
    boxShadow: "0 6px 16px -8px rgb(0 0 0 / 0.25)",
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
    fontSize: 12,
  } satisfies CSSProperties,
  itemStyle: { color: "var(--popover-foreground)" } satisfies CSSProperties,
  labelStyle: { color: "var(--popover-foreground)" } satisfies CSSProperties,
};
