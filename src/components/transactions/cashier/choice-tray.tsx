import { Button } from "@/components/ui/button";

export type Choice = { id: string; label: string; emphasis?: boolean };

/** Tombol pilihan; tombol pertama otomatis fokus tiap langkah baru (komponen di-remount per langkah). */
export function ChoiceTray({
  choices,
  onPick,
  disabled,
}: Readonly<{ choices: Choice[]; onPick: (id: string) => void; disabled?: boolean }>) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {choices.map((choice, index) => (
        <Button
          key={choice.id}
          type="button"
          size="lg"
          variant={choice.emphasis ? "default" : "outline"}
          className="h-11 text-base"
          autoFocus={index === 0}
          disabled={disabled}
          onClick={() => onPick(choice.id)}
        >
          {choice.label}
        </Button>
      ))}
    </div>
  );
}
