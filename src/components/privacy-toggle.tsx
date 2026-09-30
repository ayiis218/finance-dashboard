"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrivacyMode } from "@/components/privacy-mode";

export function PrivacyToggle() {
  const { hidden, toggle } = usePrivacyMode();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={hidden ? "Tampilkan angka" : "Sembunyikan angka"}
      onClick={toggle}
    >
      {hidden ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </Button>
  );
}
