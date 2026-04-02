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

function ptBrToFloat(s: string): number {
  if (!s) return 0;
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatPtBr(n: number): string {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Formata o raw em tempo real:
 *  - sem vírgula : adiciona separador de milhar  → "2122" → "2.122"
 *  - com vírgula : formata parte inteira + decimal → "2122,9" → "2.122,9"
 *  - no blur     : completa 2 casas decimais       → "2.122" → "2.122,00"
 */
function formatLive(raw: string): string {
  if (!raw) return "";
  const ci = raw.indexOf(",");
  if (ci === -1) {
    const n = parseInt(raw.replace(/\D/g, ""), 10);
    return n > 0 ? n.toLocaleString("pt-BR") : raw;
  }
  const intStr = raw.slice(0, ci).replace(/\D/g, "");
  const decStr = raw.slice(ci + 1);
  const intNum = parseInt(intStr, 10) || 0;
  const intFmt = intNum > 0 ? intNum.toLocaleString("pt-BR") : (intStr || "0");
  return `${intFmt},${decStr}`;
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
  const [raw, setRaw] = useState<string>(defaultValue || "");

  const displayStr = formatLive(raw);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    val = val.replace(/\./g, "");            // remove separadores de milhar que inserimos
    val = val.replace(/[^\d,]/g, "");        // só dígitos e vírgula
    // apenas uma vírgula
    const ci = val.indexOf(",");
    if (ci !== -1) val = val.slice(0, ci + 1) + val.slice(ci + 1).replace(/,/g, "");
    // máximo 2 casas decimais
    const parts = val.split(",");
    if (parts.length === 2) val = parts[0] + "," + parts[1].slice(0, 2);
    // sem zeros à esquerda
    val = val.replace(/^0+(\d)/, "$1");

    setRaw(val);
    onChange?.(ptBrToFloat(val));
  }

  function handleBlur() {
    const n = ptBrToFloat(raw);
    if (n > 0) setRaw(formatPtBr(n)); // completa ",00" se não tiver
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
        onBlur={handleBlur}
        className={`${className} ${prefix ? "pl-10" : ""}`}
      />
    </div>
  );
}
