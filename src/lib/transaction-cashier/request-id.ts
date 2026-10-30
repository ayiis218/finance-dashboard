/**
 * Id permintaan simpan (idempotency key). Dipakai sebagai `Transaction.id`,
 * jadi percobaan ulang untuk transaksi yang sama ditolak primary key alih-alih
 * membuat baris kedua (lihat `writeOnce`).
 */

/** Id acak per sesi dialog; unik antar tab, perangkat, dan pembukaan dialog. */
export function createSessionId(): string {
  const webCrypto = globalThis.crypto;
  if (webCrypto?.randomUUID) return webCrypto.randomUUID();

  const bytes = new Uint8Array(16);
  if (webCrypto?.getRandomValues) webCrypto.getRandomValues(bytes);
  else bytes.forEach((_, i) => (bytes[i] = Math.floor(Math.random() * 256)));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Berubah hanya bila isi transaksi berubah (`revision`), sehingga "Coba lagi" selalu memakai id yang sama. */
export function requestIdFor(sessionId: string, revision: number): string {
  return `${sessionId}-${revision}`;
}
