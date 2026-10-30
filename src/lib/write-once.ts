/** Format id permintaan (idempotency key) yang diterima server: 8–64 karakter huruf, angka, "_" atau "-". */
export const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/**
 * Menjalankan `write`, tapi menganggap sukses bila penulisan itu ternyata
 * SUDAH tersimpan oleh percobaan sebelumnya (klien mengulang karena respons
 * pertama hilang, atau browser mengirim ulang POST). Tanpa ini, percobaan
 * ulang membuat baris kedua.
 *
 * `alreadyRecorded` dipanggil hanya setelah `write` gagal. Bila pengecekannya
 * sendiri gagal, kegagalan ASLI yang dilempar — bukan error pengecekan.
 */
export async function writeOnce(
  write: () => Promise<void>,
  alreadyRecorded: () => Promise<boolean>,
): Promise<void> {
  try {
    await write();
  } catch (error) {
    let recorded = false;
    try {
      recorded = await alreadyRecorded();
    } catch {
      recorded = false;
    }
    if (!recorded) throw error;
  }
}
