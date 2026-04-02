"use client";

import { useState } from "react";

type MoneyInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  prefix?: string;
  onChange?: (value: number) => void;
};

/**
 * Digit-streaming: os dígitos entram pela direita, separador decimal fixo em 2 casas.
 *   "4"    → 0,04
 *   "44"   → 0,44
 *   "444"  → 4,44
 *   "4490" → 44,90   ← para R$44,90 digite 4490
 *
 * inputMode="decimal" mostra teclado com vírgula no iOS.
 * A vírgula aparece desde o primeiro dígito digitado.
 */

function initialDigits(s: string): string {
  if (!s) return "";
  const lastComma = s.lastIndexOf(",");
  const intPart = lastComma === -1 ? s : s.slice(0, lastComma);
  const decPart = lastComma === -1 ? "00" : s.slice(lastComma + 1);
  const cleanInt = intPart.replace(/\D/g, "");
  const cleanDec = decPart.replace(/\D/g, "").slice(0, 2).padEnd(2, "0");
  return (cleanInt + cleanDec).replace(/^0+/, "");
}

function digitsToDisplay(digits: string): string {
  if (!digits) return "";
  const value = Number(digits) / 100;
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function MoneyInput({
  name,
  defaultValue = "",
  className = "",
  wrapperClassName = "",
  placeholder = "0,00",
  prefix,
  onChange,
}: MoneyInputProps) {
  const [digits, setDigits] = useState<string>(() => initialDigits(defaultValue));

  const displayValue = digitsToDisplay(digits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const onlyNums = e.target.value.replace(/\D/g, "");
    const trimmed = onlyNums.replace(/^0+/, "");
    setDigits(trimmed);
    if (onChange) onChange(Number(trimmed) / 100);
  }

  return (
    <div className={`relative ${wrapperClassName}`}>
      {prefix ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--dark-text)]">
          {prefix}
        </span>
      ) : null}
      <input
        name={name}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        className={`${className} ${prefix ? "pl-10" : ""}`}
      />
    </div>
  );
}
