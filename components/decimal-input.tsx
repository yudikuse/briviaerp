"use client";

import { useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

/**
 * Converte string pt-BR para centavos inteiros.
 * "3,00" → "300", "6,54" → "654", "3,0" → "300", "3" → "300"
 */
function defaultToDigits(value: string): string {
  if (!value) return "";
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  if (!isFinite(num) || num === 0) return "";
  return String(Math.round(num * 100));
}

/** "654" → "6,54", "300" → "3,00", "" → "" */
function digitsToDisplay(digits: string): string {
  if (!digits) return "";
  const num = Number(digits) / 100;
  return num.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
}: DecimalInputProps) {
  const [digits, setDigits] = useState(() => defaultToDigits(defaultValue));

  const display = digitsToDisplay(digits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const only = e.target.value.replace(/\D/g, "");
    const trimmed = only.replace(/^0+/, "").slice(0, 7); // máx 99.999,99
    setDigits(trimmed);
  }

  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      value={display}
      placeholder={placeholder}
      onChange={handleChange}
      className={className}
    />
  );
}
