import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmountKeypad } from "@/components/transactions/cashier/amount-keypad";
import { CategoryPicker } from "@/components/transactions/cashier/category-picker";
import { ChoiceTray, type Choice } from "@/components/transactions/cashier/choice-tray";
import { DateStep } from "@/components/transactions/cashier/date-step";
import { NoteInput } from "@/components/transactions/cashier/note-input";
import { ReceiptSummary } from "@/components/transactions/cashier/receipt-summary";
import { repeatLabel, reviewLines, TYPE_LABELS } from "@/lib/transaction-cashier/copy";
import type {
  ChatAction,
  ChatState,
  FlowContext,
  TransactionKind,
} from "@/lib/transaction-cashier/flow";
import { rankAccounts, rankOptions, type TransactionSuggestions } from "@/lib/transaction-cashier/suggestions";

const REPEAT_ID = "repeat";
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

function typeChoices(ctx: FlowContext): Choice[] {
  const choices: Choice[] = TYPES.map((type) => ({ id: type, label: TYPE_LABELS[type] }));
  return ctx.last ? [{ id: REPEAT_ID, label: repeatLabel(ctx.last), emphasis: true }, ...choices] : choices;
}

function accountChoices(ctx: FlowContext, suggestions: TransactionSuggestions, excludeId?: string): Choice[] {
  return rankAccounts(ctx.accounts, suggestions.accountIds)
    .filter((a) => a.id !== excludeId)
    .map((a) => ({ id: a.id, label: a.name }));
}

/** Input untuk langkah saat ini: tombol, keypad, tanggal, catatan, atau struk. */
export function StepInput({ state, ctx, categories, suggestions, dispatch, onConfirm, onRetry, onClose }: Props) {
  const { step, draft } = state;

  switch (step) {
    case "type":
      return (
        <ChoiceTray
          choices={typeChoices(ctx)}
          onPick={(id) =>
            id === REPEAT_ID ? dispatch({ type: "repeatLast" }) : dispatch({ type: "pickType", value: id as TransactionKind })
          }
        />
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
      return <AmountKeypad onSubmit={(value) => dispatch({ type: "setAmount", value })} />;
    case "account":
      return <ChoiceTray choices={accountChoices(ctx, suggestions)} onPick={(id) => dispatch({ type: "pickAccount", id })} />;
    case "toAccount":
      return (
        <ChoiceTray
          choices={accountChoices(ctx, suggestions, draft.accountId)}
          onPick={(id) => dispatch({ type: "pickToAccount", id })}
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
      return (
        <p className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Menyimpan…
        </p>
      );
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
