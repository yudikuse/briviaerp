"use client";

import { useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  onChange?: (value: number) => void;
};

function defaultToDigits(value: string): string {
  if (!value) return "";
  const normalized = value.replace(/\./g, "").replace(",", ".");
  const num = parseFloat(normalized);
  if (!isFinite(num) || num === 0) return "";
  return String(Math.round(num * 100));
}

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
  onChange,
}: DecimalInputProps) {
  const [digits, setDigits] = useState(() => defaultToDigits(defaultValue));

  const display = digitsToDisplay(digits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const only = e.target.value.replace(/\D/g, "");
    const trimmed = only.replace(/^0+/, "").slice(0, 7);
    setDigits(trimmed);
    if (onChange) onChange(Number(trimmed) / 100);
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
