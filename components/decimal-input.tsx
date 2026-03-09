"use client";

import { useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
  maxDecimals?: number;
};

function sanitizeDecimal(value: string, maxDecimals: number) {
  const normalized = value.replace(/\./g, ",").replace(/[^\d,]/g, "");
  const firstCommaIndex = normalized.indexOf(",");

  if (firstCommaIndex === -1) {
    return normalized;
  }

  const integerPart = normalized.slice(0, firstCommaIndex);
  const decimalPart = normalized
    .slice(firstCommaIndex + 1)
    .replace(/,/g, "")
    .slice(0, maxDecimals);

  return `${integerPart},${decimalPart}`;
}

export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
  maxDecimals = 2,
}: DecimalInputProps) {
  const [value, setValue] = useState(() =>
    sanitizeDecimal(defaultValue, maxDecimals)
  );

  return (
    <input
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      placeholder={placeholder}
      value={value}
      onChange={(e) => {
        setValue(sanitizeDecimal(e.target.value, maxDecimals));
      }}
      className={className}
    />
  );
}
