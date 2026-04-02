"use client";

import { useState } from "react";

type MoneyInputProps = {
  name: string;
  defaultValue?: string;
  /** Pass this to make the component externally controlled (e.g. step 3 preço final). */
  value?: string;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  prefix?: string;
  onChange?: (value: number) => void;
};

/**
 * Parses a pt-BR formatted money string to a JS number.
 * "49,90" → 49.9  |  "1.234,56" → 1234.56  |  "50" → 50
 */
function ptBrToFloat(s: string): number {
  if (!s) return 0;
  const normalized = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
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
  const [rawStr, setRawStr] = useState<string>(defaultValue || "");

  // If caller provides `value`, they own the state; otherwise use internal rawStr
  const displayStr = value !== undefined ? value : rawStr;

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;

    // 1. Remove thousand-separator dots that come from the displayed value
    val = val.replace(/\./g, "");

    // 2. Keep only digits and at most one comma
    val = val.replace(/[^\d,]/g, "");

    // 3. Only one comma allowed — keep the first one
    const firstComma = val.indexOf(",");
    if (firstComma !== -1) {
      const before = val.slice(0, firstComma + 1);
      const after = val.slice(firstComma + 1).replace(/,/g, "");
      val = before + after;
    }

    // 4. Split to enforce max-2 decimal digits
    const parts = val.split(",");
    const intPart = parts[0].replace(/^0+/, "") || (parts.length > 1 ? "0" : "");
    const decPart = parts.length > 1 ? parts[1].slice(0, 2) : null;

    val = decPart !== null ? `${intPart},${decPart}` : intPart;

    // 5. Update internal state only in uncontrolled mode
    if (value === undefined) {
      setRawStr(val);
    }

    // 6. Fire onChange with the numeric value
    if (onChange) onChange(ptBrToFloat(val));
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
