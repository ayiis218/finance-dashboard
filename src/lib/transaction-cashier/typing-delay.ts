export const MIN_TYPING_MS = 300;
export const MAX_TYPING_MS = 600;
const PER_CHARACTER_MS = 8;

/**
 * Jeda "kasir sedang mengetik" sebelum ucapan baru. Nol saat reduced-motion
 * dan untuk transaksi berikutnya di sesi yang sama, supaya pencatatan
 * berulang tetap cepat.
 */
export function typingDelayMs(text: string, options: { reduced: boolean; repeatSession: boolean }): number {
  if (options.reduced || options.repeatSession) return 0;
  return Math.min(MAX_TYPING_MS, MIN_TYPING_MS + text.length * PER_CHARACTER_MS);
}
