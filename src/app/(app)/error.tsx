"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Menangkap error dari semua route di bawah (app)/ — termasuk
 * `findUniqueOrThrow` yang gagal (ID stale/dihapus, dsb). `error.message`
 * sengaja TIDAK ditampilkan verbatim ke user (bisa berisi detail
 * teknis/Prisma) — cuma di-log ke console buat debugging.
 */
export default function AppError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            Terjadi kesalahan
          </CardTitle>
          <CardDescription>
            Ada yang salah saat memuat halaman ini. Coba lagi, atau kembali ke Dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={reset} className="w-full sm:w-auto">
            <RotateCw className="size-4" />
            Coba Lagi
          </Button>
          <Button variant="outline" className="w-full sm:w-auto" nativeButton={false} render={<Link href="/" />}>
            Ke Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
