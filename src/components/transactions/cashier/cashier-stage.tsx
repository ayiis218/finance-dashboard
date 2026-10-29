import { AdminAvatar } from "@/components/transactions/cashier/admin-avatar";
import { KedaiScene } from "@/components/transactions/cashier/kedai-scene";
import { SpeechBubble } from "@/components/transactions/cashier/speech-bubble";
import { TercatatStamp } from "@/components/transactions/cashier/tercatat-stamp";
import { useChatMotion } from "@/components/transactions/cashier/use-chat-motion";
import { collectedAnswers, promptFor } from "@/lib/transaction-cashier/copy";
import { expressionFor } from "@/lib/transaction-cashier/expression";
import { isQuestionStep, type ChatState, type FlowContext } from "@/lib/transaction-cashier/flow";

/** Panggung: kasir di kedai, bubble ucapan di atas kepalanya, jawaban sejauh ini sebagai chip. */
export function CashierStage({ state, ctx }: Readonly<{ state: ChatState; ctx: FlowContext }>) {
  const { typingDelay } = useChatMotion(state.savedCount);
  const text = promptFor(state);
  const answers = collectedAnswers(state, ctx);
  // Status (menyimpan, tercatat, gagal) harus terasa instan; jeda mengetik hanya untuk pertanyaan.
  const speaksSlowly = isQuestionStep(state.step) || state.step === "review";
  // Keypad butuh banyak ruang; kasir mengecil supaya tombol tetap terlihat di layar kecil.
  const compact = state.step === "amount";

  return (
    <section aria-label="Kasir" className="overflow-hidden rounded-xl border">
      <div className="relative">
        <KedaiScene className="px-4 pt-3">
          <SpeechBubble text={text} typingDelay={speaksSlowly ? typingDelay(text) : 0} />
          <AdminAvatar expression={expressionFor(state)} className={compact ? "size-16 sm:size-20" : undefined} />
        </KedaiScene>
        {state.step === "done" && <TercatatStamp />}
      </div>
      {answers.length > 0 && (
        <ul aria-label="Jawaban sejauh ini" className="flex flex-wrap justify-center gap-1.5 border-t bg-muted/50 px-3 py-2">
          {answers.map((answer, index) => (
            <li key={`${index}-${answer}`} className="rounded-full border bg-background px-2.5 py-0.5 text-xs">
              {answer}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
