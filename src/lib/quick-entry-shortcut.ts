export type ShortcutEvent = {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  repeat: boolean;
  defaultPrevented: boolean;
  target: { tagName?: string; isContentEditable?: boolean } | null;
};

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Tombol `n` (tanpa modifier) membuka kasir — kecuali user sedang mengetik,
 * sudah ada dialog lain terbuka, atau event sudah ditangani pihak lain.
 * Dipisah sebagai fungsi murni supaya aturan "kapan aman" bisa diuji.
 */
export function shouldOpenQuickEntry(event: ShortcutEvent, anotherDialogOpen: boolean): boolean {
  if (event.key.toLowerCase() !== "n") return false;
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.defaultPrevented) return false;
  if (anotherDialogOpen) return false;
  const target = event.target;
  if (target?.isContentEditable) return false;
  if (target?.tagName && TYPING_TAGS.has(target.tagName.toUpperCase())) return false;
  return true;
}
