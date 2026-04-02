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
  const [rawStr, setRawStr] = useState<string>(defaultValue || "");

  const displayStr = value !== undefined ? value : rawStr;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;

    // Remove thousand-separator dots that we inserted ourselves
    val = val.replace(/\./g, "");
    // Keep only digits and comma
    val = val.replace(/[^\d,]/g, "");

    const commaIdx = val.indexOf(",");
    let newDisplay: string;
    let numericValue: number;

    if (commaIdx === -1) {
      // No comma yet — show as integer with thousand separators
      const digits = val.replace(/^0+/, "");
      if (!digits) {
        newDisplay = "";
        numericValue = 0;
      } else {
        numericValue = parseInt(digits, 10);
        newDisplay = numericValue.toLocaleString("pt-BR");
      }
    } else {
      // Comma present — natural decimal entry: "49,90", "1.349,90"
      const intStr = val.slice(0, commaIdx).replace(/^0+/, "") || "0";
      // Only keep the first comma, limit decimal to 2 digits
      const decStr = val.slice(commaIdx + 1).replace(/,/g, "").slice(0, 2);
      const intNum = parseInt(intStr, 10) || 0;
      const intFormatted = intNum.toLocaleString("pt-BR");
      newDisplay = `${intFormatted},${decStr}`;
      numericValue = parseFloat(`${intStr}.${decStr.padEnd(2, "0")}`) || 0;
    }

    if (value === undefined) setRawStr(newDisplay);
    if (onChange) onChange(numericValue);
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
        value={displayStr}
        onChange={handleChange}
        className={`${className} ${prefix ? "pl-10" : ""}`}
      />
    </div>
  );
}
