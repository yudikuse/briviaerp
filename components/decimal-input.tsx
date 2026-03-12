"use client";

import { useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

/** Normaliza para exibição: "3" → "3,00", "3,5" → "3,50" */
function formatDisplay(raw: string): string {
  if (!raw) return "";

  const parts = raw.split(",");
  const intPart = parts[0].replace(/\D/g, "") || "0";
  const decPart = (parts[1] ?? "").replace(/\D/g, "").slice(0, 2).padEnd(2, "0");

  return `${intPart},${decPart}`;
}

export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
}: DecimalInputProps) {
  const [value, setValue] = useState(() => formatDisplay(defaultValue));

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value;

    // Converte ponto em vírgula (teclado numérico)
    raw = raw.replace(/\./g, ",");

    // Apenas dígitos e uma vírgula
    raw = raw.replace(/[^0-9,]/g, "");

    // Apenas uma vírgula
    const parts = raw.split(",");
    if (parts.length > 2) {
      raw = parts[0] + "," + parts.slice(1).join("");
    }

    // Máximo 2 casas decimais
    if (parts.length === 2) {
      raw = parts[0] + "," + parts[1].slice(0, 2);
    }

    // Máximo 10 dígitos na parte inteira
    const iParts = raw.split(",");
    if (iParts[0].length > 10) {
      iParts[0] = iParts[0].slice(0, 10);
      raw = iParts.join(",");
    }

    setValue(raw);
  }

  function handleBlur() {
    setValue(formatDisplay(value));
  }

  function handleFocus(e: React.FocusEvent<HTMLInputElement>) {
    e.target.select();
  }

  return (
    <input
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={handleFocus}
      className={className}
    />
  );
}
