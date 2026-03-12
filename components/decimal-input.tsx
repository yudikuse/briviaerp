"use client";

import { useState } from "react";

type DecimalInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  placeholder?: string;
};

export default function DecimalInput({
  name,
  defaultValue = "",
  className = "",
  placeholder = "0,00",
}: DecimalInputProps) {
  const [value, setValue] = useState(defaultValue);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value;

    // teclado numérico usa ponto → converte para vírgula
    v = v.replace(/\./g, ",");

    // só dígitos e vírgula
    v = v.replace(/[^0-9,]/g, "");

    // no máximo uma vírgula
    const parts = v.split(",");
    if (parts.length > 2) v = parts[0] + "," + parts.slice(1).join("");

    // no máximo 2 casas após a vírgula
    const p2 = v.split(",");
    if (p2.length === 2) v = p2[0] + "," + p2[1].slice(0, 2);

    setValue(v);
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
      maxLength={9}
      className={className}
    />
  );
}

