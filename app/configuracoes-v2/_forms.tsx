"use client";

import type { ReactNode } from "react";
import { useTransition, useState } from "react";
import DecimalInput from "@/components/decimal-input";
import MoneyInput from "@/components/money-input";
import {
  updatePricing,
  updateGoals,
  addFixedCost,
  updateFixedCost,
  toggleFixedCost,
  deleteFixedCost,
} from "./actions";

// ─── shared ────────────────────────────────────────────────────────────────────

const inputBaseClass =
  "h-[42px] w-full rounded-[10px] bg-white px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] transition focus:ring-2 focus:ring-[#cfd8e3] lg:h-[44px]";

function FieldBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-[#667085] lg:text-[13px]">{label}</p>
      {children}
    </div>
  );
}

function SavedBadge({ savedAt }: { savedAt: string | null }) {
  if (!savedAt) return null;
  return (
    <span className="text-[12px] text-[#22c55e]">
      ✓ Salvo às {savedAt}
    </span>
  );
}

function decimalDefault(value: number | null | undefined): string {
  if (value === null || value === undefined || Number(value) === 0) return "";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function moneyDefault(value: number | null | undefined): string {
  if (!value || Number(value) === 0) return "";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function nowDateTime() {
  const now = new Date();
  const date = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `${date} ${time}`;
}

// ─── PricingForm ───────────────────────────────────────────────────────────────

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

export function PricingForm({ settings }: { settings: Settings | null }) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updatePricing(formData);
      setSavedAt(nowDateTime());
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="h-[42px] rounded-[10px] bg-[#111827] px-4 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-50 lg:h-[44px]"
        >
          {pending ? "Salvando..." : "Salvar padrões"}
        </button>
        <SavedBadge savedAt={savedAt} />
      </div>
    </form>
  );
}

// ─── GoalsForm ─────────────────────────────────────────────────────────────────

export function GoalsForm({
  monthlyProfitGoal,
  cashGoal,
  purchaseGoal,
}: {
  monthlyProfitGoal: number;
  cashGoal: number;
  purchaseGoal: number;
}) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await updateGoals(formData);
      setSavedAt(nowDateTime());
    });
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
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

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="h-[42px] rounded-[10px] bg-[#111827] px-4 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-50 lg:h-[44px]"
        >
          {pending ? "Salvando..." : "Salvar objetivos"}
        </button>
        <SavedBadge savedAt={savedAt} />
      </div>
    </form>
  );
}

// ─── FixedCostsList ────────────────────────────────────────────────────────────

type FixedCost = {
  id: string;
  descricao: string;
  valor_mensal: number;
  ativo: boolean;
  ordem: number;
};

function FixedCostRow({ item }: { item: FixedCost }) {
  const [editing, setEditing] = useState(false);
  const [pendingToggle, startToggle] = useTransition();
  const [pendingUpdate, startUpdate] = useTransition();
  const [pendingDelete, startDelete] = useTransition();

  function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("id", item.id);
    startUpdate(async () => {
      await updateFixedCost(formData);
      setEditing(false);
    });
  }

  function handleToggle() {
    const formData = new FormData();
    formData.set("id", item.id);
    formData.set("ativo", String(item.ativo));
    startToggle(() => toggleFixedCost(formData));
  }

  function handleDelete() {
    if (!confirm(`Excluir "${item.descricao}"?`)) return;
    const formData = new FormData();
    formData.set("id", item.id);
    startDelete(() => deleteFixedCost(formData));
  }

  const brl = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (editing) {
    return (
      <form onSubmit={handleUpdate} className="flex items-center gap-2 border-b border-[#edf0f4] px-4 py-3">
        <input
          name="descricao"
          defaultValue={item.descricao}
          required
          className="h-[36px] flex-1 rounded-[8px] bg-white px-2 text-[13px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
        />
        <div className="relative flex items-center">
          <span className="absolute left-2 text-[12px] text-[#667085]">R$</span>
          <MoneyInput
            name="valor_mensal"
            defaultValue={item.valor_mensal > 0 ? item.valor_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
            className="h-[36px] w-[120px] rounded-[8px] bg-white pl-8 pr-2 text-[13px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
          />
        </div>
        <button
          type="submit"
          disabled={pendingUpdate}
          className="h-[36px] rounded-[8px] bg-[#111827] px-3 text-[12px] font-medium text-white disabled:opacity-50"
        >
          {pendingUpdate ? "..." : "Salvar"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="h-[36px] rounded-[8px] px-3 text-[12px] text-[#667085] hover:bg-[#f1f4f8]"
        >
          Cancelar
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 border-b border-[#edf0f4] px-4 py-3 last:border-0">
      <div className="flex-1">
        <span className={`text-[14px] ${item.ativo ? "text-[#111827]" : "text-[#98a2b3] line-through"}`}>
          {item.descricao}
        </span>
      </div>
      <div className="w-[110px] text-right text-[14px] font-medium text-[#111827]">
        {brl(item.valor_mensal)}
      </div>
      <div className="flex items-center gap-1">
        {/* toggle ativo */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={pendingToggle}
          title={item.ativo ? "Desativar" : "Ativar"}
          className={`h-[30px] rounded-[7px] px-2 text-[11px] font-medium transition disabled:opacity-50 ${
            item.ativo
              ? "bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]"
              : "bg-[#f1f4f8] text-[#667085] hover:bg-[#e4e7ec]"
          }`}
        >
          {item.ativo ? "Ativo" : "Inativo"}
        </button>
        {/* edit */}
        <button
          type="button"
          onClick={() => setEditing(true)}
          title="Editar"
          className="h-[30px] w-[30px] rounded-[7px] text-[14px] text-[#667085] transition hover:bg-[#f1f4f8]"
        >
          ✏️
        </button>
        {/* delete */}
        <button
          type="button"
          onClick={handleDelete}
          disabled={pendingDelete}
          title="Excluir"
          className="h-[30px] w-[30px] rounded-[7px] text-[14px] text-[#667085] transition hover:bg-[#fee2e2] disabled:opacity-50"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}

function AddFixedCostForm() {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      await addFixedCost(formData);
      setSavedAt(nowDateTime());
      form.reset();
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-[38px] items-center gap-2 rounded-[10px] border border-dashed border-[#d0d5dd] bg-white px-3 text-[13px] text-[#667085] transition hover:border-[#111827] hover:text-[#111827]"
        >
          + Adicionar custo fixo
        </button>
        <SavedBadge savedAt={savedAt} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-wrap items-end gap-2 rounded-[12px] border border-[#e7ebf0] bg-white p-3">
      <div className="flex-1 space-y-1 min-w-[160px]">
        <p className="text-[11px] font-medium text-[#667085]">Descrição</p>
        <input
          name="descricao"
          placeholder="Ex: Aluguel"
          required
          className="h-[38px] w-full rounded-[8px] bg-[#f6f7f9] px-2 text-[13px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
        />
      </div>
      <div className="space-y-1 w-[140px]">
        <p className="text-[11px] font-medium text-[#667085]">Valor mensal</p>
        <MoneyInput
          name="valor_mensal"
          prefix="R$"
          wrapperClassName="w-full"
          className="h-[38px] w-full rounded-[8px] bg-[#f6f7f9] px-3 text-[13px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="h-[38px] rounded-[8px] bg-[#111827] px-3 text-[13px] font-medium text-white disabled:opacity-50"
        >
          {pending ? "Salvando..." : "Adicionar"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="h-[38px] rounded-[8px] px-3 text-[13px] text-[#667085] hover:bg-[#f1f4f8]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function FixedCostsList({ items }: { items: FixedCost[] }) {
  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[12px] bg-white">
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-[14px] text-[#98a2b3]">
            Nenhum custo fixo cadastrado.
          </p>
        ) : (
          items.map((item) => <FixedCostRow key={item.id} item={item} />)
        )}
      </div>
      <AddFixedCostForm />
    </div>
  );
}
