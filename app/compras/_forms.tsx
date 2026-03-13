"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useTransition, useCallback } from "react";
import MoneyInput from "@/components/money-input";
import DecimalInput from "@/components/decimal-input";
import { savePurchase, updateProductPrice } from "./actions";

// ─── shared ────────────────────────────────────────────────────────────────────

const inputBase =
  "h-[52px] w-full rounded-[10px] bg-white px-3 text-[16px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] transition focus:ring-2 focus:ring-[#cfd8e3] lg:h-[48px] lg:text-[15px]";

const CATEGORIAS = [
  "Vestidos", "Conjuntos", "Blusas", "Calças", "Saias",
  "Shorts", "Jaquetas", "Macacões", "Outros",
];
const TAMANHOS = ["PP", "P", "M", "G", "GG", "XG"];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v: number) {
  return `${v.toFixed(2).replace(".", ",")}%`;
}

function nowDateTime() {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(2);
  const hh = String(now.getHours()).padStart(2, "0");
  const mi = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  return `${dd}/${mm}/${yy} às ${hh}:${mi}:${ss}`;
}

function SavedBadge({ savedAt }: { savedAt: string | null }) {
  if (!savedAt) return null;
  return <span className="text-[12px] text-[#22c55e]">✓ Salvo em {savedAt}</span>;
}

function FieldBlock({ label, children, span2 = false }: { label: string; children: ReactNode; span2?: boolean }) {
  return (
    <div className={`space-y-2 ${span2 ? "md:col-span-2" : ""}`}>
      <p className="text-[13px] font-medium text-[#667085] lg:text-[12px]">{label}</p>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
      {children}
    </p>
  );
}

// ─── pricing calculator ────────────────────────────────────────────────────────

interface PricingInputs {
  custo: number;
  markup: number;
  margem: number;
  impostos: number;
  cartao: number;
  marketing: number;
  outras: number;
  embalagem: number;
  peca: number;
  modo: "MARKUP" | "MARGEM";
}

interface PricingResult {
  sugerido: number;
  lucroBruto: number;
  lucroLiquido: number;
  margemLiquida: number;
}

function calcPricing(p: PricingInputs): PricingResult {
  const base = p.custo + p.embalagem + p.peca;
  let sugerido = 0;

  if (p.modo === "MARKUP" && p.markup > 0) {
    sugerido = base * p.markup;
  } else if (p.modo === "MARGEM" && p.margem > 0) {
    const deducts = (p.impostos + p.cartao + p.marketing + p.outras + p.margem) / 100;
    if (deducts < 1) sugerido = base / (1 - deducts);
  }

  const deducoes = sugerido * (p.impostos + p.cartao + p.marketing + p.outras) / 100;
  const lucroBruto = sugerido - base;
  const lucroLiquido = lucroBruto - deducoes;
  const margemLiquida = sugerido > 0 ? (lucroLiquido / sugerido) * 100 : 0;

  return { sugerido, lucroBruto, lucroLiquido, margemLiquida };
}

// ─── StatCard ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, accent, sub,
}: { label: string; value: string; accent?: boolean; sub?: string }) {
  return (
    <div className={`rounded-[12px] p-4 ${accent ? "bg-[#ff6a2b] text-white" : "bg-[#f6f7f9]"}`}>
      <p className={`text-[12px] font-medium ${accent ? "text-white/80" : "text-[#667085]"}`}>{label}</p>
      <p className={`mt-2 text-[20px] font-semibold tracking-[-0.03em] ${accent ? "text-white" : "text-[#111827]"}`}>
        {value}
      </p>
      {sub && <p className={`mt-1 text-[11px] ${accent ? "text-white/70" : "text-[#98a2b3]"}`}>{sub}</p>}
    </div>
  );
}

// ─── PurchaseForm ──────────────────────────────────────────────────────────────

type Settings = {
  default_markup_x?: number | null;
  default_target_margin_pct?: number | null;
  default_taxes_pct?: number | null;
  default_card_fee_pct?: number | null;
  default_marketing_pct?: number | null;
  default_other_deductions_pct?: number | null;
  default_packaging_rs?: number | null;
  default_piece_expense_rs?: number | null;
  pricing_mode?: string | null;
};

export function PurchaseForm({
  nextCode,
  settings,
}: {
  nextCode: string;
  settings: Settings | null;
}) {
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [customCategoria, setCustomCategoria] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // pricing state
  const modo = (settings?.pricing_mode ?? "MARKUP") as "MARKUP" | "MARGEM";
  const [custo, setCusto] = useState(0);
  const [markup, setMarkup] = useState(Number(settings?.default_markup_x ?? 3));
  const [margem, setMargem] = useState(Number(settings?.default_target_margin_pct ?? 0));
  const [impostos, setImpostos] = useState(Number(settings?.default_taxes_pct ?? 0));
  const [cartao, setCartao] = useState(Number(settings?.default_card_fee_pct ?? 0));
  const [marketing, setMarketing] = useState(Number(settings?.default_marketing_pct ?? 0));
  const [outras, setOutras] = useState(Number(settings?.default_other_deductions_pct ?? 0));
  const [embalagem, setEmbalagem] = useState(Number(settings?.default_packaging_rs ?? 0));
  const [peca, setPeca] = useState(Number(settings?.default_piece_expense_rs ?? 0));
  const [precoFinalStr, setPrecoFinalStr] = useState("");
  const [userEditedFinal, setUserEditedFinal] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  const result = calcPricing({ custo, markup, margem, impostos, cartao, marketing, outras, embalagem, peca, modo });

  useEffect(() => {
    if (!userEditedFinal && result.sugerido > 0) {
      setPrecoFinalStr(result.sugerido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }, [result.sugerido, userEditedFinal]);

  function parsePtBr(s: string) {
    return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  }

  const decFmt = (v: number) => v > 0 ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

  // Step 1 → collect product fields into state, go to step 2
  function handleStep1(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = {};
    fd.forEach((v, k) => { data[k] = String(v); });
    setFormData(data);
    setStep(2);
  }

  // Step 2 → collect purchase fields, go to step 3
  function handleStep2(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, string> = { ...formData };
    fd.forEach((v, k) => { data[k] = String(v); });
    setFormData(data);
    setStep(3);
  }

  // Step 3 → final submit
  async function handleStep3(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const all = new FormData();
    // merge step 1+2 data
    Object.entries(formData).forEach(([k, v]) => all.set(k, v));
    // merge step 3 fields
    fd.forEach((v, k) => all.set(k, v));
    all.set("preco_sugerido", String(result.sugerido));
    all.set("preco_final", String(parsePtBr(precoFinalStr)));
    startTransition(() => { savePurchase(all); });
    await new Promise(r => setTimeout(r, 900));
    setSavedAt(nowDateTime());
    setFormData({});
    setStep(1);
    setUserEditedFinal(false);
    setCusto(0);
  }

  const steps = [
    { n: 1, label: "Produto" },
    { n: 2, label: "Compra" },
    { n: 3, label: "Preço" },
  ];

  return (
    <div className="space-y-5">
      {/* ── step indicator ── */}
      <div className="flex items-center gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <button
              type="button"
              onClick={() => { if (s.n < step) setStep(s.n as 1 | 2 | 3); }}
              className={[
                "flex h-[32px] w-[32px] items-center justify-center rounded-full text-[13px] font-semibold transition shrink-0",
                step === s.n ? "bg-[#111827] text-white" : s.n < step ? "bg-[#22c55e] text-white cursor-pointer" : "bg-[#e5e7eb] text-[#9ca3af]",
              ].join(" ")}
            >
              {s.n < step ? "✓" : s.n}
            </button>
            <span className={[
              "ml-1.5 text-[12px] font-medium",
              step === s.n ? "text-[#111827]" : s.n < step ? "text-[#22c55e]" : "text-[#9ca3af]",
            ].join(" ")}>
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div className={`mx-2 flex-1 h-[2px] rounded-full ${s.n < step ? "bg-[#22c55e]" : "bg-[#e5e7eb]"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── step 1: dados do produto ── */}
      {step === 1 && (
        <form onSubmit={handleStep1} className="space-y-4">
          <SectionTitle>Dados do produto</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldBlock label="Código (automático)">
              <input
                name="codigo"
                defaultValue={formData.codigo || nextCode}
                readOnly
                className={`${inputBase} bg-[#f6f7f9] text-[#667085] cursor-default`}
              />
            </FieldBlock>
            <FieldBlock label="Nome da peça">
              <input name="nome" required defaultValue={formData.nome || ""} placeholder="Ex: Vestido floral" className={inputBase} />
            </FieldBlock>
            <FieldBlock label="Categoria">
              {customCategoria ? (
                <div className="flex gap-2">
                  <input name="categoria" placeholder="Nova categoria" defaultValue={formData.categoria || ""} className={inputBase} />
                  <button type="button" onClick={() => setCustomCategoria(false)}
                    className="h-[52px] px-4 rounded-[10px] text-[16px] text-[#667085] hover:bg-[#f1f4f8] ring-1 ring-[#e7ebf0]">
                    ↩
                  </button>
                </div>
              ) : (
                <select name="categoria" className={inputBase} defaultValue={formData.categoria || ""}
                  onChange={e => { if (e.target.value === "__nova__") setCustomCategoria(true); }}>
                  <option value="">Selecionar...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__nova__">+ Nova categoria...</option>
                </select>
              )}
            </FieldBlock>
            <FieldBlock label="Tamanho">
              <select name="tamanho" className={inputBase} defaultValue={formData.tamanho || ""}>
                <option value="">Selecionar...</option>
                {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </FieldBlock>
            <FieldBlock label="Cor">
              <input name="cor" defaultValue={formData.cor || ""} placeholder="Ex: Preto" className={inputBase} />
            </FieldBlock>
            <FieldBlock label="Fornecedor">
              <input name="fornecedor" defaultValue={formData.fornecedor || ""} placeholder="Nome do fornecedor" className={inputBase} />
            </FieldBlock>
          </div>
          <button type="submit"
            className="h-[52px] w-full rounded-[10px] bg-[#111827] text-[16px] font-medium text-white transition hover:opacity-90 md:w-auto md:px-8">
            Próximo →
          </button>
        </form>
      )}

      {/* ── step 2: dados da compra ── */}
      {step === 2 && (
        <form onSubmit={handleStep2} className="space-y-4">
          <SectionTitle>Dados da compra</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <FieldBlock label="Data da compra">
              <input
                name="data_compra"
                type="date"
                defaultValue={formData.data_compra || new Date().toISOString().slice(0, 10)}
                className={inputBase}
              />
            </FieldBlock>
            <FieldBlock label="Quantidade">
              <input name="quantidade" type="number" min="1" defaultValue={formData.quantidade || "1"} className={inputBase} />
            </FieldBlock>
            <FieldBlock label="Custo unitário" span2>
              <MoneyInput
                name="custo_unitario"
                prefix="R$"
                wrapperClassName="w-full"
                className={inputBase}
                defaultValue={formData.custo_unitario ? (Number(formData.custo_unitario) > 0 ? Number(formData.custo_unitario).toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : "") : ""}
                onChange={(v: number) => setCusto(v)}
              />
            </FieldBlock>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(1)}
              className="h-[52px] flex-1 rounded-[10px] border border-[#e7ebf0] text-[16px] text-[#667085] hover:bg-[#f6f7f9] md:flex-none md:px-6">
              ← Voltar
            </button>
            <button type="submit"
              className="h-[52px] flex-1 rounded-[10px] bg-[#111827] text-[16px] font-medium text-white hover:opacity-90 md:flex-none md:px-8">
              Próximo →
            </button>
          </div>
        </form>
      )}

      {/* ── step 3: precificação ── */}
      {step === 3 && (
        <form onSubmit={handleStep3} className="space-y-4">
          <SectionTitle>Precificação</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {modo === "MARKUP" ? (
              <FieldBlock label="Markup (x)">
                <DecimalInput name="markup_x" defaultValue={decFmt(markup)} className={inputBase} onChange={(v: number) => setMarkup(v)} />
              </FieldBlock>
            ) : (
              <FieldBlock label="Margem alvo (%)">
                <DecimalInput name="margem_pct" defaultValue={decFmt(margem)} className={inputBase} onChange={(v: number) => setMargem(v)} />
              </FieldBlock>
            )}
            <input type="hidden" name="markup_x" value={markup} />
            <input type="hidden" name="margem_pct" value={margem} />
            <FieldBlock label="Impostos (%)">
              <DecimalInput name="impostos_pct" defaultValue={decFmt(impostos)} className={inputBase} onChange={(v: number) => setImpostos(v)} />
            </FieldBlock>
            <FieldBlock label="Taxa cartão (%)">
              <DecimalInput name="cartao_pct" defaultValue={decFmt(cartao)} className={inputBase} onChange={(v: number) => setCartao(v)} />
            </FieldBlock>
            <FieldBlock label="Marketing (%)">
              <DecimalInput name="marketing_pct" defaultValue={decFmt(marketing)} className={inputBase} onChange={(v: number) => setMarketing(v)} />
            </FieldBlock>
            <FieldBlock label="Outras deduções (%)">
              <DecimalInput name="outras_pct" defaultValue={decFmt(outras)} className={inputBase} onChange={(v: number) => setOutras(v)} />
            </FieldBlock>
            <FieldBlock label="Embalagem (R$)">
              <MoneyInput name="embalagem_rs" prefix="R$" wrapperClassName="w-full" className={inputBase} defaultValue={decFmt(embalagem)} onChange={(v: number) => setEmbalagem(v)} />
            </FieldBlock>
            <FieldBlock label="Despesa por peça (R$)">
              <MoneyInput name="peca_rs" prefix="R$" wrapperClassName="w-full" className={inputBase} defaultValue={decFmt(peca)} onChange={(v: number) => setPeca(v)} />
            </FieldBlock>
          </div>

          {/* resultado ao vivo */}
          <div className="grid gap-3 grid-cols-2">
            <StatCard label="Preço sugerido" value={brl(result.sugerido)} accent />
            <StatCard label="Margem líquida" value={pct(result.margemLiquida)} />
            <StatCard label="Lucro bruto" value={brl(result.lucroBruto)} />
            <StatCard label="Lucro líquido" value={brl(result.lucroLiquido)} />
          </div>

          <FieldBlock label="Preço de venda final">
            <div className="relative flex items-center">
              <span className="absolute left-3 text-[16px] text-[#667085] pointer-events-none">R$</span>
              <input
                type="text"
                inputMode="numeric"
                value={precoFinalStr}
                onChange={e => { setUserEditedFinal(true); setPrecoFinalStr(e.target.value.replace(/[^0-9,.]/g, "")); }}
                placeholder={brl(result.sugerido).replace("R$\u00a0", "")}
                className={`${inputBase} pl-10`}
              />
            </div>
            {userEditedFinal && result.sugerido > 0 && (
              <button type="button" onClick={() => setUserEditedFinal(false)}
                className="mt-1 text-[12px] text-[#667085] underline underline-offset-2 hover:text-[#111827]">
                Usar preço sugerido ({brl(result.sugerido)})
              </button>
            )}
          </FieldBlock>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep(2)}
              className="h-[52px] flex-1 rounded-[10px] border border-[#e7ebf0] text-[16px] text-[#667085] hover:bg-[#f6f7f9] md:flex-none md:px-6">
              ← Voltar
            </button>
            <button type="submit" disabled={pending}
              className="h-[52px] flex-1 rounded-[10px] bg-[#111827] text-[16px] font-medium text-white hover:opacity-90 disabled:opacity-50 md:flex-none md:px-8">
              {pending ? "Salvando..." : "Registrar compra"}
            </button>
          </div>
          <SavedBadge savedAt={savedAt} />
        </form>
      )}
    </div>
  );
}

// ─── StockTable ────────────────────────────────────────────────────────────────

export type StockItem = {
  id: string;
  codigo: string;
  nome: string;
  cor: string | null;
  tamanho: string | null;
  categoria: string | null;
  custo_unitario: number;
  preco_atual: number;
  preco_sugerido: number;
  estoque_atual: number;
};

function StockCard({ item }: { item: StockItem }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", item.id);
    startTransition(() => { updateProductPrice(fd); });
    await new Promise(r => setTimeout(r, 700));
    setEditing(false);
    setSavedAt(nowDateTime());
  }

  const margem = item.preco_atual > 0
    ? ((item.preco_atual - item.custo_unitario) / item.preco_atual) * 100
    : 0;

  const stockColor = item.estoque_atual <= 0
    ? "bg-[#fee2e2] text-[#ef4444]"
    : item.estoque_atual <= 3
    ? "bg-[#fef3c7] text-[#d97706]"
    : "bg-[#dcfce7] text-[#166534]";

  return (
    <div className="border-b border-[#f1f4f8] p-4 last:border-0">
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[#98a2b3]">{item.codigo}</span>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stockColor}`}>
              {item.estoque_atual} un.
            </span>
          </div>
          <p className="mt-1 text-[15px] font-semibold text-[#111827] leading-tight">{item.nome}</p>
          {(item.categoria || item.cor || item.tamanho) && (
            <p className="mt-0.5 text-[12px] text-[#98a2b3]">
              {[item.categoria, item.cor, item.tamanho].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-[#98a2b3]">Margem</p>
          <p className="text-[14px] font-semibold text-[#111827]">{pct(margem)}</p>
        </div>
      </div>

      {/* bottom row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] text-[#98a2b3] uppercase tracking-wide">Custo</p>
            <p className="text-[13px] font-medium text-[#667085]">{brl(item.custo_unitario)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[#98a2b3] uppercase tracking-wide">Venda</p>
            {editing ? (
              <form onSubmit={handleSubmit} className="flex items-center gap-1 mt-0.5">
                <MoneyInput
                  name="preco_atual"
                  prefix="R$"
                  defaultValue={item.preco_atual > 0 ? item.preco_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
                  className="h-[40px] w-[110px] rounded-[9px] bg-white pl-8 pr-2 text-[15px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
                />
                <button type="submit" disabled={pending}
                  className="h-[40px] w-[40px] rounded-[9px] bg-[#111827] text-[13px] text-white disabled:opacity-50 flex items-center justify-center">
                  {pending ? "·" : "✓"}
                </button>
                <button type="button" onClick={() => setEditing(false)}
                  className="h-[40px] w-[40px] rounded-[9px] text-[13px] text-[#667085] hover:bg-[#f1f4f8] flex items-center justify-center">
                  ✕
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5">
                <p className="text-[13px] font-semibold text-[#111827]">{brl(item.preco_atual)}</p>
                <button type="button" onClick={() => setEditing(true)}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-[14px] text-[#98a2b3] hover:bg-[#f1f4f8] hover:text-[#111827]">
                  ✏️
                </button>
                {savedAt && <span className="text-[10px] text-[#22c55e]">✓</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop table row (lg+)
function StockRow({ item }: { item: StockItem }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", item.id);
    startTransition(() => { updateProductPrice(fd); });
    await new Promise(r => setTimeout(r, 700));
    setEditing(false);
    setSavedAt(nowDateTime());
  }

  const margem = item.preco_atual > 0
    ? ((item.preco_atual - item.custo_unitario) / item.preco_atual) * 100
    : 0;

  const stockColor = item.estoque_atual <= 0
    ? "text-[#ef4444]"
    : item.estoque_atual <= 3
    ? "text-[#f59e0b]"
    : "text-[#22c55e]";

  return (
    <tr className="border-t border-[#f1f4f8] hover:bg-[#fafbfc]">
      <td className="px-4 py-3 text-[12px] font-mono text-[#667085]">{item.codigo}</td>
      <td className="px-4 py-3">
        <div className="text-[13px] font-medium text-[#111827]">{item.nome}</div>
        <div className="text-[11px] text-[#98a2b3]">
          {[item.categoria, item.cor, item.tamanho].filter(Boolean).join(" · ")}
        </div>
      </td>
      <td className={`px-4 py-3 text-center text-[14px] font-semibold ${stockColor}`}>
        {item.estoque_atual}
      </td>
      <td className="px-4 py-3 text-[13px] text-[#667085]">{brl(item.custo_unitario)}</td>
      <td className="px-4 py-3">
        {editing ? (
          <form onSubmit={handleSubmit} className="flex items-center gap-1">
            <MoneyInput
              name="preco_atual"
              prefix="R$"
              defaultValue={item.preco_atual > 0 ? item.preco_atual.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}
              className="h-[44px] w-[120px] rounded-[9px] bg-white pl-9 pr-2 text-[16px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
            />
            <button type="submit" disabled={pending}
              className="h-[44px] rounded-[9px] bg-[#111827] px-3 text-[13px] text-white disabled:opacity-50">
              {pending ? "..." : "OK"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="h-[44px] rounded-[9px] px-3 text-[13px] text-[#667085] hover:bg-[#f1f4f8]">
              ✕
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-medium text-[#111827]">{brl(item.preco_atual)}</span>
            <button type="button" onClick={() => setEditing(true)}
              className="h-[36px] w-[36px] flex items-center justify-center rounded-[8px] text-[14px] text-[#98a2b3] hover:text-[#111827] hover:bg-[#f1f4f8]">
              ✏️
            </button>
            {savedAt && <span className="text-[10px] text-[#22c55e]">✓</span>}
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-[13px] text-[#667085]">{pct(margem)}</td>
    </tr>
  );
}

export function StockTable({ items }: { items: StockItem[] }) {
  const [search, setSearch] = useState("");

  const filtered = items.filter(i =>
    !search ||
    i.nome.toLowerCase().includes(search.toLowerCase()) ||
    i.codigo.toLowerCase().includes(search.toLowerCase()) ||
    (i.cor ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-3">
      <input
        type="text"
        placeholder="Buscar por nome, código ou cor..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="h-[52px] w-full rounded-[10px] bg-white px-3 text-[16px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
      />

      {filtered.length === 0 ? (
        <p className="rounded-[12px] bg-white px-4 py-8 text-center text-[14px] text-[#98a2b3]">
          {search ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
        </p>
      ) : (
        <>
          {/* Mobile: cards */}
          <div className="rounded-[12px] bg-white lg:hidden">
            {filtered.map(item => <StockCard key={item.id} item={item} />)}
          </div>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-[12px] bg-white lg:block">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Código", "Produto", "Estoque", "Custo", "Preço venda", "Margem"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => <StockRow key={item.id} item={item} />)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
