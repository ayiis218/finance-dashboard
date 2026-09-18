export const dynamic = "force-dynamic";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionImport } from "@/components/transactions/transaction-import";
import { prisma } from "@/lib/prisma";
import { importTransactions } from "@/lib/actions/transactions";

export default async function TransactionImportPage() {
  const accounts = await prisma.bankAccount.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-1 duration-300">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke Transaksi
      </Link>

      <Card>
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
          <CardTitle>Format CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Header wajib persis (urutan tidak boleh diubah):{" "}
            <code className="break-all rounded bg-muted px-1 py-0.5 text-foreground">
              tanggal,rekening,tipe,kategori,jumlah,catatan,rekening_tujuan
            </code>
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">tanggal</span> — format{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">YYYY-MM-DD</code> (mis.
              2026-09-01) atau{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">DD/MM/YYYY</code> (mis.
              01/09/2026, format ini diterima juga karena Excel kadang otomatis mengubah tanggal ke
              format ini). Preview di bawah akan menampilkan tanggal hasil baca sistem — cek dulu
              sebelum submit kalau ragu.
            </li>
            <li>
              <span className="font-medium text-foreground">rekening</span> — nama rekening persis
              seperti di halaman Rekening (tidak case-sensitive)
            </li>
            <li>
              <span className="font-medium text-foreground">tipe</span> — INCOME/EXPENSE/TRANSFER
              atau Pemasukan/Pengeluaran/Transfer
            </li>
            <li>
              <span className="font-medium text-foreground">jumlah</span> — angka positif tanpa
              pemisah ribuan (mis. 150000, bukan 150.000)
            </li>
            <li>
              <span className="font-medium text-foreground">catatan</span> — opsional, boleh
              dikosongkan
            </li>
            <li>
              <span className="font-medium text-foreground">rekening_tujuan</span> — opsional,
              cuma dipakai kalau tipe TRANSFER. Isi nama rekening tujuan (persis seperti di
              halaman Rekening) kalau uangnya masuk ke rekening lain di sistem ini (mis. transfer
              antar rekening sendiri, atau tarik tunai dari rekening bank ke Cash Tunai) — saldo
              rekening tujuan otomatis ikut bertambah. Kosongkan kalau transfer keluar sistem
              (mis. ke rekening orang lain) — saldo rekening asal tetap berkurang seperti biasa.
            </li>
          </ul>
          <p>
            Ada 2 mode import (bisa dipilih di halaman upload):
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium text-foreground">Data historis (default)</span> — saldo
              rekening SEKARANG sudah benar dan tidak akan diubah sama sekali. Transaksi yang
              diimport murni jadi catatan historis untuk laporan/chart. Cocok untuk backfill 1
              tahun ke belakang tanpa mengganggu saldo saat ini.
            </li>
            <li>
              <span className="font-medium text-foreground">Sesuaikan saldo (normal)</span> — tiap
              baris akan menambah/mengurangi saldo rekening seperti input transaksi manual biasa.
              Kalau backfill dari titik waktu tertentu dan mau saldo ikut ter-track dari sana, set
              dulu saldo rekening ke nilai di titik itu lewat halaman{" "}
              <Link href="/accounts" className="underline underline-offset-2">
                Rekening → Edit
              </Link>
              , baru upload transaksi-transaksi setelahnya. Preview akan menghitung saldo proyeksi
              sebelum kamu submit.
            </li>
          </ul>
        </CardContent>
      </Card>

      <TransactionImport accounts={accounts.map((a) => ({ id: a.id, name: a.name, balance: Number(a.balance) }))} importAction={importTransactions} />
    </div>
  );
}