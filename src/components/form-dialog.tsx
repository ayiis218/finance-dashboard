"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function FormDialog({
  title,
  triggerLabel,
  triggerIcon,
  triggerVariant = "default",
  triggerSize = "sm",
  action,
  children,
}: {
  title: string;
  triggerLabel?: string;
  triggerIcon?: React.ReactNode;
  triggerVariant?: "default" | "ghost" | "outline";
  triggerSize?: "sm" | "icon";
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size={triggerSize} variant={triggerVariant} className="cursor-pointer" />}>
        {triggerIcon ?? <Plus className="size-4" />}
        {triggerLabel}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-4"
          action={(formData) => {
            startTransition(async () => {
              try {
                await action(formData);
                toast.success("Berhasil disimpan");
                setOpen(false);
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Gagal menyimpan");
              }
            });
          }}
        >
          {children}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {isPending ? "Menyimpan..." : "Simpan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
