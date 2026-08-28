"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatIDR } from "@/lib/format";

type Payment = { id: string; date: Date; amount: number; note: string | null };

export function RepaymentDialog({
  receivableId,
  payments,
  remaining,
  createAction,
  deleteAction,
}: Readonly<{
  receivableId: string;
  payments: Payment[];
  remaining: number;
  createAction: (formData: FormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}>) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        Riwayat Cicilan
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Riwayat Pembayaran</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {payments.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada pembayaran.</p>
          )}
          {payments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span>{formatIDR(p.amount)}</span>
                <span className="text-xs text-muted-foreground">
                  {p.date.toLocaleDateString("id-ID")}
                  {p.note && ` · ${p.note}`}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                disabled={isPending}
                onClick={() => startTransition(() => deleteAction(p.id))}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>

        {remaining > 0 && (
          <form
            className="space-y-3 border-t pt-3"
            action={(formData) => {
              startTransition(async () => {
                await createAction(formData);
              });
            }}
          >
            <input type="hidden" name="receivableId" value={receivableId} />
            <p className="text-xs text-muted-foreground">
              Sisa: {formatIDR(remaining)}
            </p>
            <div className="space-y-2">
              <Label htmlFor={`pay-date-${receivableId}`}>Tanggal</Label>
              <Input
                id={`pay-date-${receivableId}`}
                name="date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`pay-amount-${receivableId}`}>Jumlah Bayar</Label>
              <Input
                id={`pay-amount-${receivableId}`}
                name="amount"
                type="number"
                max={remaining}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`pay-note-${receivableId}`}>Catatan</Label>
              <Input
                id={`pay-note-${receivableId}`}
                name="note"
                placeholder="Opsional"
              />
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              Catat Pembayaran
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
