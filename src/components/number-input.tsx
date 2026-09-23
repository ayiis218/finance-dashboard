"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

function toDigits(value: string, allowNegative?: boolean): string {
  const negative = allowNegative === true && value.trim().startsWith("-");
  const digits = value.replace(/[^\d]/g, "");
  return negative && digits ? `-${digits}` : digits;
}

function formatDisplay(digits: string): string {
  if (!digits || digits === "-") return "";
  return new Intl.NumberFormat("id-ID").format(Number(digits));
}

/**
 * Text input that shows the value grouped with thousand separators (id-ID)
 * while typing, but submits the plain digit string as `name` in the form's
 * FormData — so server actions keep reading a normal number, unaffected by
 * the display formatting.
 */
export function NumberInput({
  name,
  id,
  defaultValue,
  required,
  placeholder,
  min,
  max,
  className,
  disabled,
  allowNegative,
}: Readonly<{
  name: string;
  id?: string;
  defaultValue?: number | string | null;
  required?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
  /** Allow a leading "-" so the field can carry negative amounts (e.g. a planned monthly deficit). */
  allowNegative?: boolean;
}>) {
  const [digits, setDigits] = React.useState(() =>
    defaultValue !== undefined && defaultValue !== null && defaultValue !== ""
      ? toDigits(String(defaultValue), allowNegative)
      : "",
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let next = toDigits(e.target.value, allowNegative);
    if (next && max !== undefined && Number(next) > max) next = String(max);
    setDigits(next);
  };

  const handleBlur = () => {
    if (digits && min !== undefined && Number(digits) < min) setDigits(String(min));
  };

  return (
    <>
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatDisplay(digits)}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={className}
      />
      <input type="hidden" name={name} value={digits} />
    </>
  );
}
