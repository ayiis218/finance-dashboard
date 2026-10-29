import { Button } from "@/components/ui/button";
import type { ReviewLine } from "@/lib/transaction-cashier/copy";
import type { EditableStep } from "@/lib/transaction-cashier/flow";

/** Ringkasan bergaya struk; tiap baris yang bisa diubah punya tombol "Ubah". */
export function ReceiptSummary({
  lines,
  onEdit,
  onConfirm,
}: Readonly<{ lines: ReviewLine[]; onEdit: (step: EditableStep) => void; onConfirm: () => void }>) {
  return (
    <div className="space-y-3">
      {/* drop-shadow di pembungkus: filter dihitung setelah mask, jadi bayangan ikut tepi bergerigi. */}
      <div className="drop-shadow-sm">
        <dl className="receipt-paper divide-y divide-dashed divide-chat-ink/25 px-3 pt-1 pb-4 font-mono text-sm">
          {lines.map((line) => (
            <div key={line.label} className="flex items-center justify-between gap-3 py-2">
              <dt className="text-chat-ink/70">{line.label}</dt>
              <dd className="flex min-w-0 items-center gap-2">
                <span className="min-w-0 truncate text-right font-medium">{line.value}</span>
                {line.editStep && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    aria-label={`Ubah ${line.label}`}
                    onClick={() => onEdit(line.editStep!)}
                  >
                    Ubah
                  </Button>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <Button type="button" size="lg" className="h-11 w-full text-base" autoFocus onClick={onConfirm}>
        Catat
      </Button>
    </div>
  );
}
