import Link from "next/link";
import { usePrivacyMode } from "@/components/privacy-mode";
import { Button } from "@/components/ui/button";
import { AmountKeypad } from "@/components/transactions/cashier/amount-keypad";
import { CategoryPicker } from "@/components/transactions/cashier/category-picker";
import { ChoiceTray, type Choice } from "@/components/transactions/cashier/choice-tray";
import { DateStep } from "@/components/transactions/cashier/date-step";
import { NoteInput } from "@/components/transactions/cashier/note-input";
import { ReceiptSummary } from "@/components/transactions/cashier/receipt-summary";
import { SavingNotice } from "@/components/transactions/cashier/saving-notice";
import { TapGuard } from "@/components/transactions/cashier/tap-guard";
import { EXTERNAL_LABEL, repeatLabel, reviewLines, TYPE_LABELS } from "@/lib/transaction-cashier/copy";
import type {
  ChatAction,
  ChatState,
  FlowContext,
  TransactionKind,
} from "@/lib/transaction-cashier/flow";
import { rankAccounts, rankOptions, type TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

const EXTERNAL_ID = "external";
const TYPES: TransactionKind[] = ["EXPENSE", "INCOME", "TRANSFER"];

type Props = Readonly<{
  state: ChatState;
  ctx: FlowContext;
  categories: string[];
  suggestions: TransactionSuggestions;
  dispatch: (action: ChatAction) => void;
  onConfirm: () => void;
  onRetry: () => void;
  onClose: () => void;
}>;

const TYPE_CHOICES: Choice[] = TYPES.map((type) => ({ id: type, label: TYPE_LABELS[type] }));

function accountChoices(ctx: FlowContext, suggestions: TransactionSuggestions, excludeId?: string): Choice[] {
  return rankAccounts(ctx.accounts, suggestions.accountIds)
    .filter((a) => a.id !== excludeId)
    .map((a) => ({ id: a.id, label: a.name }));
}

/**
 * Input untuk langkah saat ini: tombol, keypad, tanggal, catatan, atau struk.
 * Dibungkus `TapGuard`; pemanggil memasang ulang komponen ini per langkah (lewat `key`),
 * jadi jeda tap dimulai ulang di setiap langkah.
 */
export function StepInput(props: Props) {
  return (
    <TapGuard>
      <StepInputBody {...props} />
    </TapGuard>
  );
}

function StepInputBody({ state, ctx, categories, suggestions, dispatch, onConfirm, onRetry, onClose }: Props) {
  const { step, draft } = state;
  const { hidden: privacyMode } = usePrivacyMode();

  switch (step) {
    case "type":
      return (
        <div className="space-y-2">
          <ChoiceTray choices={TYPE_CHOICES} onPick={(id) => dispatch({ type: "pickType", value: id as TransactionKind })} />
          {/* Sengaja bukan sel pertama dan tidak ter-autofocus: tombol "Catat lagi" di langkah selesai
              berada di posisi sel pertama, jadi double-tap/Enter beruntun tidak boleh jatuh ke sini. */}
          {ctx.last && (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="h-11 w-full text-base"
              onClick={() => dispatch({ type: "repeatLast" })}
            >
              {repeatLabel(ctx.last, { today: ctx.today, maskAmount: privacyMode })}
            </Button>
          )}
        </div>
      );
    case "category": {
      const preferred = draft.type ? suggestions.categoriesByType[draft.type] : [];
      return (
        <CategoryPicker
          categories={rankOptions(categories, preferred)}
          onPick={(value) => dispatch({ type: "pickCategory", value })}
        />
      );
    }
    case "amount":
      return <AmountKeypad initialAmount={draft.amount} onSubmit={(value) => dispatch({ type: "setAmount", value })} />;
    case "account":
      return <ChoiceTray choices={accountChoices(ctx, suggestions)} onPick={(id) => dispatch({ type: "pickAccount", id })} />;
    case "toAccount":
      return (
        <ChoiceTray
          choices={[...accountChoices(ctx, suggestions, draft.accountId), { id: EXTERNAL_ID, label: EXTERNAL_LABEL }]}
          onPick={(id) => dispatch({ type: "pickToAccount", id: id === EXTERNAL_ID ? null : id })}
        />
      );
    case "date":
      return <DateStep today={ctx.today} onPick={(value) => dispatch({ type: "pickDate", value })} />;
    case "note":
      return <NoteInput onSubmit={(value) => dispatch({ type: "setNote", value })} />;
    case "review":
      return (
        <ReceiptSummary
          lines={reviewLines(draft, ctx)}
          onEdit={(editStep) => dispatch({ type: "edit", step: editStep })}
          onConfirm={onConfirm}
        />
      );
    case "saving":
      return <SavingNotice />;
    case "done":
      return (
        <ChoiceTray
          choices={[
            { id: "again", label: "Catat lagi", emphasis: true },
            { id: "close", label: "Selesai" },
          ]}
          onPick={(id) => (id === "again" ? dispatch({ type: "startOver" }) : onClose())}
        />
      );
    case "error":
      return <ChoiceTray choices={[{ id: "retry", label: "Coba lagi", emphasis: true }]} onPick={onRetry} />;
    case "blocked":
      return (
        <Button nativeButton={false} render={<Link href="/accounts" />} size="lg" className="h-11 w-full text-base">
          Ke halaman Accounts
        </Button>
      );
  }
}
