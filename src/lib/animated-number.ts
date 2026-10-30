import { formatIDR } from "@/lib/format";

/**
 * Kalau `text` adalah angka yang aman dianimasikan (Rupiah hasil `formatIDR`,
 * atau bilangan bulat polos), kembalikan fungsi progress (0..1) → teks;
 * selain itu `null` (persen, "8,6 bulan", "-", topeng privacy, dst. dibiarkan
 * statis — tidak ada tebakan format yang bisa menyesatkan). `progress = 1`
 * SELALU menghasilkan persis `text` aslinya.
 */
export function animatableFormatter(text: string): ((progress: number) => string) | null {
  const normalized = text.replace(/\s/g, " ").trim();

  const rupiah = /^([+-]?)Rp ?(\d{1,3}(?:\.\d{3})*)$/.exec(normalized);
  if (rupiah) {
    const [, sign, digits] = rupiah;
    const target = Number(digits.replaceAll(".", ""));
    return (progress) =>
      progress >= 1 ? text : `${sign}${formatIDR(Math.round(target * progress))}`;
  }

  if (/^\d+$/.test(normalized)) {
    const target = Number(normalized);
    return (progress) => (progress >= 1 ? text : String(Math.round(target * progress)));
  }

  return null;
}
