"use client";

import { useMemo, useState } from "react";

type MoneyInputProps = {
  name: string;
  defaultValue?: string;
  className?: string;
  wrapperClassName?: string;
  placeholder?: string;
  prefix?: string;
};

function onlyDigits(value: string) {
  return value.replace(/\D/g, "");
}

function formatDigitsToBrl(digits: string) {
  if (!digits) return "";

  const value = Number(digits) / 100;

  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function normalizeInitialValue(value: string) {
  const digits = onlyDigits(value);
  if (!digits || Number(digits) === 0) return "";
  return digits;
}

export default function MoneyInput({
  name,
  defaultValue = "",
  className = "",
  wrapperClassName = "",
  placeholder = "0,00",
  prefix,
}: MoneyInputProps) {
  const [digits, setDigits] = useState(() => normalizeInitialValue(defaultValue));

  const formattedValue = useMemo(() => formatDigitsToBrl(digits), [digits]);

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
        inputMode="numeric"
        autoComplete="off"
        spellCheck={false}
        placeholder={placeholder}
        value={formattedValue}
        onChange={(e) => {
          setDigits(onlyDigits(e.target.value));
        }}
        className={`${className} ${prefix ? "pl-10" : ""}`}
      />
    </div>
  );
}
