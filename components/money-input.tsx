"use client";

import { useState } from "react";

type MoneyInputProps = {
  name: string;
  defaultValue?: string;
  value?: string;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  prefix?: string;
  onChange?: (value: number) => void;
};

/**
 * Converts a pt-BR formatted string (e.g. "1.234,56") into a raw digit string
 * representing cents (e.g. "123456"). Used only for initialisation from defaultValue.
 */
function initialDigits(s: string): string {
  if (!s) return "";
  const lastComma = s.lastIndexOf(",");
  let intPart: string;
  let decPart: string;
  if (lastComma === -1) {
    intPart = s;
    decPart = "00";
  } else {
    intPart = s.slice(0, lastComma);
    decPart = s.slice(lastComma + 1);
  }
  const cleanInt = intPart.replace(/\D/g, "");
  const cleanDec = decPart.replace(/\D/g, "").slice(0, 2).padEnd(2, "0");
  return (cleanInt + cleanDec).replace(/^0+/, "");
}

/** Formats a raw digit string (cents) into a pt-BR display string. */
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
  value,
  className = "",
  wrapperClassName = "",
  placeholder = "0,00",
  prefix,
  onChange,
}: MoneyInputProps) {
  const [digits, setDigits] = useState<string>(() => initialDigits(defaultValue));

  // When `value` is provided externally, parse it fresh each render.
  // Otherwise use internal digit state.
  const displayValue =
    value !== undefined
      ? digitsToDisplay(initialDigits(value))
      : digitsToDisplay(digits);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip everything except digits (comma/period are decimal separators
    // the user types visually, but the streaming approach just needs digits).
    const onlyNums = e.target.value.replace(/\D/g, "");
    const trimmed = onlyNums.replace(/^0+/, "");
    if (value === undefined) setDigits(trimmed);
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
        inputMode="decimal"   /* decimal keyboard on iOS — shows comma/period key */
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
