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
 * MoneyInput — entrada natural pt-BR.
 *
 * Comportamento:
 *  - Com foco  : mostra o que o usuário está digitando (ex: "44" ou "44,9")
 *  - Sem foco  : formata automaticamente com 2 casas decimais (ex: "44,00")
 *  - "44"  → R$ 44,00   (NÃO digit-streaming; 44 reais, não 44 centavos)
 *  - "44,9" → R$ 44,90
 *  - "1349" → R$ 1.349,00 (separador de milhar aplicado no blur)
 */
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
  const [focused, setFocused] = useState(false);

  // Enquanto com foco mostra o raw (permite editar livremente).
  // Sem foco formata com 2 casas decimais e separador de milhar.
  const displayStr = (() => {
    if (focused) return raw;
    if (!raw) return "";
    const n = ptBrToFloat(raw);
    return n > 0 ? formatPtBr(n) : raw;
  })();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    let val = e.target.value;
    val = val.replace(/\./g, "");           // remove separadores de milhar
    val = val.replace(/[^\d,]/g, "");       // mantém apenas dígitos e vírgula
    // apenas uma vírgula
    const ci = val.indexOf(",");
    if (ci !== -1) val = val.slice(0, ci + 1) + val.slice(ci + 1).replace(/,/g, "");
    // máximo 2 casas decimais
    const parts = val.split(",");
    if (parts.length === 2) val = parts[0] + "," + parts[1].slice(0, 2);
    // sem zeros à esquerda na parte inteira (exceto "0,xx")
    val = val.replace(/^0+(\d)/, "$1");

    setRaw(val);
    onChange?.(ptBrToFloat(val));
  }

  function handleBlur() {
    setFocused(false);
    const n = ptBrToFloat(raw);
    if (n > 0) setRaw(formatPtBr(n)); // formata no blur: "44" → "44,00"
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
        onFocus={() => setFocused(true)}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`${className} ${prefix ? "pl-10" : ""}`}
      />
    </div>
  );
}
