import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getReceivablesWithStatus } from "@/lib/queries/receivables";
import { getSummary } from "@/lib/queries/dashboard";
import { authorizedSync } from "@/lib/sync-auth";

/**
 * Foto posisi keuangan untuk Second Brain.
 *
 * Berbeda sifatnya dari /api/export/transactions: itu aliran perubahan
 * (cursor, tombstone, idempotensi), ini foto keadaan. Tiap pengambilan
 * menimpa yang sebelumnya, jadi tidak ada satu pun dari kecanggihan itu
 * yang dibutuhkan di sini.
 *
 * Yang dikirim hanya ANGKA — tidak ada daftar rekening, aset, atau
 * investasi. Rinciannya (nomor rekening, cara akses, dokumen) dikelola di
 * Second Brain dalam bentuk terenkripsi, dan sengaja tidak pernah
 * menyeberang jaringan. Lihat rencana-dukungan-gudang-informasi.md §4–§5.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Kunci bulan ISO, bukan teks tampilan — kontrak API tidak boleh bergantung locale. */
function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Nominal dikirim sebagai string. Presisi `Decimal` tidak muat di float JS,
 * dan string mencegah konsumen melakukan aritmetika float di atasnya.
 *
 * Catatan jujur: getSummary() sudah mengubah Decimal jadi number lebih dulu,
 * jadi string di sini melindungi konsumen — bukan memulihkan presisi yang
 * mungkin sudah hilang. Aman selama nominalnya bilangan bulat rupiah; kalau
 * suatu saat ada pecahan, bagian ini harus ditinjau ulang.
 */
const money = (v: unknown) => String(v ?? 0);

const MONTHS_BACK = 6;

export async function GET(req: NextRequest) {
  if (!authorizedSync(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // getSummary() dipanggil ulang, BUKAN dihitung ulang. Ia sudah memuat
  // rumus net worth yang sama dengan yang tampil di dashboard — kalau
  // angkanya berbeda, berarti ada yang tidak dipakai ulang semestinya.
  const [summary, receivables, accountCount, assetCount, investmentCount] =
    await Promise.all([
      getSummary(),
      getReceivablesWithStatus(),
      prisma.bankAccount.count(),
      prisma.asset.count(),
      prisma.investment.count(),
    ]);

  // Yang dihitung hanya yang belum lunas — piutang yang sudah selesai tidak
  // berguna bagi konsumen maupun ahli waris.
  const unsettled = receivables.filter((r) => r.status !== "SETTLED").length;

  // Data tertua di antara ketiganya. Satu angka cukup: kalau yang paling
  // lama pun masih baru, seluruhnya baru. Receivable tidak punya kolom
  // updatedAt, jadi sengaja tidak ikut dihitung.
  const [oldestAccount, oldestAsset, oldestInvestment] = await Promise.all([
    prisma.bankAccount.aggregate({ _min: { updatedAt: true } }),
    prisma.asset.aggregate({ _min: { updatedAt: true } }),
    prisma.investment.aggregate({ _min: { updatedAt: true } }),
  ]);

  const oldestUpdatedAt = [
    oldestAccount._min.updatedAt,
    oldestAsset._min.updatedAt,
    oldestInvestment._min.updatedAt,
  ]
    .filter((d): d is Date => d !== null)
    .sort((a, b) => a.getTime() - b.getTime())[0];

  // Pengeluaran per bulan. getMonthlyExpenseComparison() yang sudah ada
  // tidak dipakai karena kunci bulannya berupa teks tampilan hasil
  // toLocaleDateString — itu akan pecah begitu locale server berbeda.
  const since = new Date();
  since.setMonth(since.getMonth() - (MONTHS_BACK - 1), 1);
  since.setHours(0, 0, 0, 0);

  const expenses = await prisma.transaction.findMany({
    where: { type: "EXPENSE", date: { gte: since } },
    select: { amount: true, date: true },
  });

  const byMonth = new Map<string, number>();
  for (const tx of expenses) {
    const key = monthKey(tx.date);
    byMonth.set(key, (byMonth.get(key) ?? 0) + Number(tx.amount));
  }

  return NextResponse.json({
    capturedAt: new Date().toISOString(),
    totals: {
      wallet: money(summary.totalBalance),
      assets: money(summary.totalAssets),
      investments: money(summary.totalInvestments),
      piutang: money(summary.totalReceivables),
      utang: money(summary.totalDebt),
      net: money(summary.netWorth),
    },
    counts: {
      accounts: accountCount,
      assets: assetCount,
      investments: investmentCount,
      receivables: unsettled,
    },
    oldestUpdatedAt: oldestUpdatedAt?.toISOString() ?? null,
    monthlyExpense: [...byMonth.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({ month, total: money(total) })),
  });
}
