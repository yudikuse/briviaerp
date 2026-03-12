"use client";

import { useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

/**
 * Keeps only digits and ONE comma. Does NOT reformat while typing —
 * the user types freely and we just block invalid characters.
 * The server action receives e.g. "3,00" and converts with parseDecimalInput.
 */
export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
}: DecimalInputProps) {
  const [value, setValue] = useState(defaultValue);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;

    // Allow digits and at most one comma; also allow single dot → convert to comma
    let filtered = raw
      .replace(/\./g, ",")       // convert dots to commas
      .replace(/[^0-9,]/g, "");  // strip everything else

    // Keep only first comma
    const parts = filtered.split(",");
    if (parts.length > 2) {
      filtered = parts[0] + "," + parts.slice(1).join("");
    }

    // Limit decimal part to 2 digits
    if (parts.length === 2) {
      filtered = parts[0] + "," + parts[1].slice(0, 2);
    }

    setValue(filtered);
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
      className={className}
    />
  );
}
