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
 * Converts the pt-BR formatted defaultValue (e.g. "1.234,56" or "1,40")
 * into a raw digits string used internally (e.g. "123456" or "140").
 *
 * Rules:
 *  - Remove thousand-separators (dots before the last comma)
 *  - Remove the comma
 *  - Result is cents as integer string: "1,40" → "140", "1.234,56" → "123456"
 */
function initialDigits(defaultValue: string): string {
  if (!defaultValue) return "";

  const trimmed = defaultValue.trim();
  if (!trimmed) return "";

  // Find last comma — that's the decimal separator in pt-BR
  const lastComma = trimmed.lastIndexOf(",");

  let intPart: string;
  let decPart: string;

  if (lastComma === -1) {
    // No comma at all — treat as whole number with 00 cents
    intPart = trimmed;
    decPart = "00";
  } else {
    intPart = trimmed.slice(0, lastComma);
    decPart = trimmed.slice(lastComma + 1);
  }

  // Strip dots (thousand separators) and non-digits from integer part
  const cleanInt = intPart.replace(/\D/g, "");
  // Pad/trim decimal part to exactly 2 digits
  const cleanDec = decPart.replace(/\D/g, "").slice(0, 2).padEnd(2, "0");

  const digits = cleanInt + cleanDec;

  // Drop leading zeros but keep at least one digit
  const trimmed2 = digits.replace(/^0+/, "") || "";
  return trimmed2;
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
  const [digits, setDigits] = useState(() => initialDigits(defaultValue));

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
        inputMode="numeric"
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
