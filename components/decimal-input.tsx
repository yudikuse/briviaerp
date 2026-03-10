"use client";

import { useMemo, useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

function normalizeInitialValue(value: string) {
  if (!value) return "";
  return value
    .replace(/\./g, ",")
    .replace(/[^0-9,]/g, "")
    .replace(/,+/g, ",")
    .replace(/^,/, "");
}

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

export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
}: DecimalInputProps) {
  const [value, setValue] = useState(() => normalizeInitialValue(defaultValue));

  const displayValue = useMemo(() => value, [value]);

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
        setValue(sanitizeDecimalInput(e.target.value));
      }}
      className={className}
    />
  );
}
