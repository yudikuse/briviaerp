"use client";

import { useMemo, useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

function sanitizeDecimalInput(value: string) {
  const normalized = value.replace(/\./g, ",");
  let result = "";
  let hasComma = false;

  for (const char of normalized) {
    if (/\d/.test(char)) {
      result += char;
      continue;
    }

    if (char === "," && !hasComma) {
      result += char;
      hasComma = true;
    }
  }

  return result;
}

function formatPtBrDecimal(value: string) {
  if (!value) return "";

  const [rawInteger = "", rawDecimal = ""] = value.split(",");
  const integerOnly = rawInteger.replace(/\D/g, "") || "0";
  const decimalOnly = rawDecimal.replace(/\D/g, "").slice(0, 2);

  const integerFormatted = Number(integerOnly).toLocaleString("pt-BR");

  return `${integerFormatted},${decimalOnly.padEnd(2, "0")}`;
}

function normalizeInitialValue(value: string) {
  if (!value) return "";

  const sanitized = sanitizeDecimalInput(value);
  if (!sanitized) return "";

  return sanitized;
}

export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
}: DecimalInputProps) {
  const [rawValue, setRawValue] = useState(() =>
    normalizeInitialValue(defaultValue)
  );

  const displayValue = useMemo(
    () => formatPtBrDecimal(rawValue),
    [rawValue]
  );

  return (
    <input
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={displayValue}
      placeholder={placeholder}
      onChange={(e) => {
        setRawValue(sanitizeDecimalInput(e.target.value));
      }}
      className={className}
    />
  );
}
