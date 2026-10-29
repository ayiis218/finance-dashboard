import { AdminAvatar } from "@/components/transactions/cashier/admin-avatar";
import { SpeechBubble } from "@/components/transactions/cashier/speech-bubble";
import { collectedAnswers, promptFor } from "@/lib/transaction-cashier/copy";
import { expressionFor } from "@/lib/transaction-cashier/expression";
import type { ChatState, FlowContext } from "@/lib/transaction-cashier/flow";

/** Panggung: kasir di layar, bubble ucapan di atas kepalanya, jawaban sejauh ini sebagai chip. */
export function CashierStage({ state, ctx }: Readonly<{ state: ChatState; ctx: FlowContext }>) {
  const answers = collectedAnswers(state, ctx);

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 px-4 pt-4 pb-3">
      <SpeechBubble text={promptFor(state)} />
      <AdminAvatar expression={expressionFor(state.step)} />
      {answers.length > 0 && (
        <ul aria-label="Jawaban sejauh ini" className="flex flex-wrap justify-center gap-1.5">
          {answers.map((answer, index) => (
            <li key={`${index}-${answer}`} className="rounded-full border bg-background px-2.5 py-0.5 text-xs">
              {answer}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
