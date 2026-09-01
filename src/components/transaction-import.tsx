"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { toast } from "sonner";
import { formatDate } from "date-fns";
import { CheckCircle2, Download, Loader2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { SummaryStats } from "@/components/summary-stats";
import { headersMatch, validateImportRow, type ValidationResult } from "@/lib/csv-transactions";
import { formatIDR } from "@/lib/format";

type Account = { id: string; name: string; balance: number };

type ImportedRow = {
  accountId: string;
  type: "INCOME" | "EXPENSE" | "TRANSFER";
  category: string;
  amount: number;
  date: Date;
  note?: string;
};

export function TransactionImport({
  accounts,
  importAction,
}: Readonly<{
  accounts: Account[];
  importAction: (
    rows: ImportedRow[],
    options?: { skipBalanceUpdate?: boolean },
  ) => Promise<{ imported: number }>;
}>) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [results, setResults] = useState<ValidationResult[] | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [ackNegative, setAckNegative] = useState(false);
  const [skipBalanceUpdate, setSkipBalanceUpdate] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handleDownloadTemplate = () => {
    const sampleAccount = accounts[0]?.name ?? "Nama Rekening";
    const csv = [
      "tanggal,rekening,tipe,kategori,jumlah,catatan",
      `2025-09-01,${sampleAccount},EXPENSE,Makan,50000,Contoh pengeluaran`,
      `2025-09-05,${sampleAccount},INCOME,Gaji,5000000,`,
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template-transaksi.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (file: File) => {
    setFileError(null);
    setResults(null);
    setAckNegative(false);
    const text = await file.text();
    const parsed = Papa.parse<Record<string, string>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    if (!headersMatch(parsed.meta.fields)) {
      setFileError(
        "Format kolom tidak sesuai template. Header harus persis: tanggal,rekening,tipe,kategori,jumlah,catatan",
      );
      return;
    }

    setResults(parsed.data.map((raw, i) => validateImportRow(raw, accounts, i)));
  };

  const validRows = (results ?? []).filter(
    (r): r is Extract<ValidationResult, { ok: true }> => r.ok,
  );
  const hasErrors = (results?.length ?? 0) > validRows.length;

  const balanceImpact = accounts
    .map((a) => {
      const delta = validRows
        .filter((r) => r.row.accountId === a.id && r.row.type !== "TRANSFER")
        .reduce((sum, r) => sum + (r.row.type === "EXPENSE" ? -r.row.amount : r.row.amount), 0);
      return { ...a, delta, projected: a.balance + delta };
    })
    .filter((a) => a.delta !== 0);

  const hasNegative = !skipBalanceUpdate && balanceImpact.some((a) => a.projected < 0);

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const res = await importAction(
          validRows.map((r) => r.row),
          { skipBalanceUpdate },
        );
        toast.success(`Berhasil import ${res.imported} transaksi`);
        router.push("/transactions");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal import");
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
              <Download className="size-4" />
              Download Template CSV
            </Button>
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              Pilih File CSV
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
                e.target.value = "";
              }}
            />
          </div>
          {fileError && <p className="text-sm text-destructive">{fileError}</p>}

          <div className="rounded-md border bg-muted/30 p-3">
            <label className="flex cursor-pointer items-start gap-2 text-sm">
              <Checkbox
                checked={skipBalanceUpdate}
                onCheckedChange={(checked) => setSkipBalanceUpdate(checked)}
                className="mt-0.5"
              />
              <span>
                <span className="font-medium">Data historis — jangan ubah saldo rekening</span>
                <br />
                <span className="text-muted-foreground">
                  Aktifkan kalau saldo rekening SEKARANG sudah benar dan transaksi yang diimport
                  cuma untuk catatan historis (mis. backfill 1 tahun ke belakang). Kalau
                  dimatikan, saldo rekening akan disesuaikan (tambah/kurang) seperti input
                  transaksi manual biasa.
                </span>
              </span>
            </label>
          </div>
        </CardContent>
      </Card>

      {results && results.length > 0 && (
        <>
          {skipBalanceUpdate ? (
            <p className="rounded-md border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              Mode data historis aktif — saldo rekening <span className="font-medium">tidak akan diubah</span> oleh import ini.
            </p>
          ) : (
            balanceImpact.length > 0 && (
              <SummaryStats
                items={balanceImpact.map((a) => ({
                  label: a.name,
                  value: formatIDR(a.projected),
                  sublabel: `saat ini ${formatIDR(a.balance)}`,
                  tone: a.projected < 0 ? ("negative" as const) : undefined,
                }))}
              />
            )
          )}

          <Card>
            <CardHeader>
              <CardTitle>
                Preview {results.length} Baris
                {hasErrors && ` — ${results.length - validRows.length} error`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Rekening</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="text-right">Jumlah</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((r) => (
                      <TableRow key={r.index}>
                        <TableCell>{r.index + 1}</TableCell>
                        <TableCell>
                          {r.ok ? formatDate(r.row.date, "dd MMM yyyy") : r.raw.tanggal}
                        </TableCell>
                        <TableCell>{r.raw.rekening}</TableCell>
                        <TableCell>{r.raw.tipe}</TableCell>
                        <TableCell>{r.raw.kategori}</TableCell>
                        <TableCell className="text-right">{r.raw.jumlah}</TableCell>
                        <TableCell>
                          {r.ok ? (
                            <span className="inline-flex items-center gap-1 text-green-600">
                              <CheckCircle2 className="size-4" /> OK
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-red-600">
                              <XCircle className="size-4 shrink-0" />
                              {r.error}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 space-y-3">
                {hasNegative && (
                  <label className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={ackNegative}
                      onCheckedChange={(checked) => setAckNegative(checked)}
                    />
                    Saya paham saldo akan menjadi minus, tetap lanjutkan
                  </label>
                )}
                <Button
                  disabled={
                    hasErrors || validRows.length === 0 || isPending || (hasNegative && !ackNegative)
                  }
                  onClick={handleConfirm}
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  {isPending ? "Mengimpor..." : `Konfirmasi Import ${validRows.length} Transaksi`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}