"use client";

import type { ReactNode } from "react";
import DecimalInput from "@/components/decimal-input";
import MoneyInput from "@/components/money-input";

const inputBaseClass =
  "h-[42px] w-full rounded-[10px] bg-white px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] transition focus:ring-2 focus:ring-[#cfd8e3] lg:h-[44px]";

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-[#667085] lg:text-[13px]">
        {label}
      </p>
      {children}
    </div>
  );
}

type Settings = {
  default_markup_x?: number | null;
  default_target_margin_pct?: number | null;
  default_taxes_pct?: number | null;
  default_card_fee_pct?: number | null;
  default_marketing_pct?: number | null;
  default_other_deductions_pct?: number | null;
  default_packaging_rs?: number | null;
  default_piece_expense_rs?: number | null;
};

function decimalDefault(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).replace(".", ",");
}

function moneyDefault(value: number | null | undefined) {
  if (!value || Number(value) === 0) return "";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function PricingForm({
  settings,
  action,
}: {
  settings: Settings | null;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <FieldBlock label="Markup (x)">
          <DecimalInput
            name="default_markup_x"
            defaultValue={decimalDefault(settings?.default_markup_x)}
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Margem alvo (%)">
          <DecimalInput
            name="default_target_margin_pct"
            defaultValue={decimalDefault(settings?.default_target_margin_pct)}
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Impostos (%)">
          <DecimalInput
            name="default_taxes_pct"
            defaultValue={decimalDefault(settings?.default_taxes_pct)}
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Taxa cartão (%)">
          <DecimalInput
            name="default_card_fee_pct"
            defaultValue={decimalDefault(settings?.default_card_fee_pct)}
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Marketing (%)">
          <DecimalInput
            name="default_marketing_pct"
            defaultValue={decimalDefault(settings?.default_marketing_pct)}
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Outras deduções (%)">
          <DecimalInput
            name="default_other_deductions_pct"
            defaultValue={decimalDefault(settings?.default_other_deductions_pct)}
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Embalagem">
          <MoneyInput
            name="default_packaging_rs"
            defaultValue={moneyDefault(settings?.default_packaging_rs)}
            prefix="R$"
            wrapperClassName="w-full"
            className={inputBaseClass}
          />
        </FieldBlock>

        <FieldBlock label="Despesa por peça">
          <MoneyInput
            name="default_piece_expense_rs"
            defaultValue={moneyDefault(settings?.default_piece_expense_rs)}
            prefix="R$"
            wrapperClassName="w-full"
            className={inputBaseClass}
          />
        </FieldBlock>
      </div>

      <div className="pt-1">
        <button
          type="submit"
          className="h-[42px] rounded-[10px] bg-[#111827] px-4 text-[14px] font-medium text-white transition hover:opacity-90 lg:h-[44px]"
        >
          Salvar padrões
        </button>
      </div>
    </form>
  );
}

export function GoalsForm({
  monthlyProfitGoal,
  cashGoal,
  purchaseGoal,
  action,
}: {
  monthlyProfitGoal: number;
  cashGoal: number;
  purchaseGoal: number;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="grid gap-3">
      <FieldBlock label="Meta de lucro">
        <MoneyInput
          name="monthly_profit_goal_rs"
          defaultValue={moneyDefault(monthlyProfitGoal)}
          prefix="R$"
          wrapperClassName="w-full"
          className={inputBaseClass}
        />
      </FieldBlock>

      <FieldBlock label="Caixa">
        <MoneyInput
          name="cash_goal_rs"
          defaultValue={moneyDefault(cashGoal)}
          prefix="R$"
          wrapperClassName="w-full"
          className={inputBaseClass}
        />
      </FieldBlock>

      <FieldBlock label="Compras">
        <MoneyInput
          name="purchase_goal_rs"
          defaultValue={moneyDefault(purchaseGoal)}
          prefix="R$"
          wrapperClassName="w-full"
          className={inputBaseClass}
        />
      </FieldBlock>

      <div className="pt-1">
        <button
          type="submit"
          className="h-[42px] rounded-[10px] bg-[#111827] px-4 text-[14px] font-medium text-white transition hover:opacity-90 lg:h-[44px]"
        >
          Salvar objetivos
        </button>
      </div>
    </form>
  );
}
