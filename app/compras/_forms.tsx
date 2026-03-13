"use client";

import type { ReactNode } from "react";
import { useState, useEffect, useTransition, useCallback } from "react";
import MoneyInput from "@/components/money-input";
import DecimalInput from "@/components/decimal-input";
import { savePurchase, updateProductPrice } from "./actions";

// ─── shared ────────────────────────────────────────────────────────────────────

const inputBase =
  "h-[42px] w-full rounded-[10px] bg-white px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] transition focus:ring-2 focus:ring-[#cfd8e3] lg:h-[44px]";

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
      <p className="text-[12px] font-medium text-[#667085] lg:text-[13px]">{label}</p>
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

  const result = calcPricing({ custo, markup, margem, impostos, cartao, marketing, outras, embalagem, peca, modo });

  // sync preço final with suggested when suggested changes (only if user hasn't overridden)
  const [userEditedFinal, setUserEditedFinal] = useState(false);
  useEffect(() => {
    if (!userEditedFinal && result.sugerido > 0) {
      setPrecoFinalStr(result.sugerido.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    }
  }, [result.sugerido, userEditedFinal]);

  function parsePtBr(s: string) {
    return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("preco_sugerido", String(result.sugerido));
    fd.set("preco_final", String(parsePtBr(precoFinalStr)));
    startTransition(() => { savePurchase(fd); });
    await new Promise(r => setTimeout(r, 900));
    setSavedAt(nowDateTime());
    form.reset();
    setUserEditedFinal(false);
    setCusto(0);
  }

  const decFmt = (v: number) => v > 0 ? v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* ── dados do produto ── */}
      <div className="space-y-3">
        <SectionTitle>Dados do produto</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          <FieldBlock label="Código (automático)">
            <input
              name="codigo"
              defaultValue={nextCode}
              readOnly
              className={`${inputBase} bg-[#f6f7f9] text-[#667085] cursor-default`}
            />
          </FieldBlock>

          <FieldBlock label="Nome da peça">
            <input name="nome" required placeholder="Ex: Vestido floral" className={inputBase} />
          </FieldBlock>

          <FieldBlock label="Categoria">
            {customCategoria ? (
              <div className="flex gap-2">
                <input name="categoria" placeholder="Nova categoria" className={inputBase} />
                <button type="button" onClick={() => setCustomCategoria(false)}
                  className="h-[42px] px-3 rounded-[10px] text-[13px] text-[#667085] hover:bg-[#f1f4f8] ring-1 ring-[#e7ebf0]">
                  ↩
                </button>
              </div>
            ) : (
              <select name="categoria" className={inputBase}
                onChange={e => { if (e.target.value === "__nova__") { setCustomCategoria(true); } }}>
                <option value="">Selecionar...</option>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="__nova__">+ Nova categoria...</option>
              </select>
            )}
          </FieldBlock>

          <FieldBlock label="Tamanho">
            <select name="tamanho" className={inputBase}>
              <option value="">Selecionar...</option>
              {TAMANHOS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </FieldBlock>

          <FieldBlock label="Cor">
            <input name="cor" placeholder="Ex: Preto" className={inputBase} />
          </FieldBlock>

          <FieldBlock label="Fornecedor">
            <input name="fornecedor" placeholder="Nome do fornecedor" className={inputBase} />
          </FieldBlock>
        </div>
      </div>

      {/* ── dados da compra ── */}
      <div className="space-y-3">
        <SectionTitle>Dados da compra</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          <FieldBlock label="Data da compra">
            <input
              name="data_compra"
              type="date"
              defaultValue={new Date().toISOString().slice(0, 10)}
              className={inputBase}
            />
          </FieldBlock>

          <FieldBlock label="Quantidade">
            <input
              name="quantidade"
              type="number"
              min="1"
              defaultValue="1"
              className={inputBase}
            />
          </FieldBlock>

          <FieldBlock label="Custo unitário" span2>
            <MoneyInput
              name="custo_unitario"
              prefix="R$"
              wrapperClassName="w-full"
              className={inputBase}
              defaultValue=""
              onChange={(v: number) => setCusto(v)}
            />
          </FieldBlock>
        </div>
      </div>

      {/* ── precificação ── */}
      <div className="space-y-3">
        <SectionTitle>Precificação</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          {modo === "MARKUP" ? (
            <FieldBlock label="Markup (x)">
              <DecimalInput
                name="markup_x"
                defaultValue={decFmt(markup)}
                className={inputBase}
                onChange={(v: number) => setMarkup(v)}
              />
            </FieldBlock>
          ) : (
            <FieldBlock label="Margem alvo (%)">
              <DecimalInput
                name="margem_pct"
                defaultValue={decFmt(margem)}
                className={inputBase}
                onChange={(v: number) => setMargem(v)}
              />
            </FieldBlock>
          )}

          {/* hidden field for the other mode value */}
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
      </div>

      {/* ── resultado ── */}
      <div className="space-y-3">
        <SectionTitle>Resultado</SectionTitle>
        <div className="grid gap-3 md:grid-cols-2">
          <StatCard label="Preço sugerido" value={brl(result.sugerido)} accent />
          <StatCard label="Margem líquida" value={pct(result.margemLiquida)} />
          <StatCard label="Lucro bruto unit." value={brl(result.lucroBruto)} />
          <StatCard label="Lucro líquido unit." value={brl(result.lucroLiquido)} />
        </div>

        <FieldBlock label="Preço de venda final">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-[14px] text-[#667085] pointer-events-none">R$</span>
            <input
              type="text"
              inputMode="numeric"
              value={precoFinalStr}
              onChange={e => {
                setUserEditedFinal(true);
                setPrecoFinalStr(e.target.value.replace(/[^0-9,.]/g, ""));
              }}
              placeholder={brl(result.sugerido).replace("R$\u00a0", "")}
              className={`${inputBase} pl-9`}
            />
          </div>
          {userEditedFinal && result.sugerido > 0 && (
            <button type="button" onClick={() => { setUserEditedFinal(false); }}
              className="mt-1 text-[11px] text-[#667085] underline underline-offset-2 hover:text-[#111827]">
              Usar preço sugerido ({brl(result.sugerido)})
            </button>
          )}
        </FieldBlock>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <button
          type="submit"
          disabled={pending}
          className="h-[42px] rounded-[10px] bg-[#111827] px-5 text-[14px] font-medium text-white transition hover:opacity-90 disabled:opacity-50 lg:h-[44px]"
        >
          {pending ? "Salvando..." : "Registrar compra"}
        </button>
        <SavedBadge savedAt={savedAt} />
      </div>
    </form>
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
              className="h-[32px] w-[110px] rounded-[7px] bg-white pl-8 pr-2 text-[12px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
            />
            <button type="submit" disabled={pending}
              className="h-[32px] rounded-[7px] bg-[#111827] px-2 text-[11px] text-white disabled:opacity-50">
              {pending ? "..." : "OK"}
            </button>
            <button type="button" onClick={() => setEditing(false)}
              className="h-[32px] rounded-[7px] px-2 text-[11px] text-[#667085] hover:bg-[#f1f4f8]">
              ✕
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1">
            <span className="text-[13px] font-medium text-[#111827]">{brl(item.preco_atual)}</span>
            <button type="button" onClick={() => setEditing(true)}
              className="rounded px-1 text-[11px] text-[#98a2b3] hover:text-[#111827]">
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
        className="h-[40px] w-full rounded-[10px] bg-white px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] focus:ring-2 focus:ring-[#cfd8e3]"
      />

      {filtered.length === 0 ? (
        <p className="rounded-[12px] bg-white px-4 py-8 text-center text-[14px] text-[#98a2b3]">
          {search ? "Nenhum produto encontrado." : "Nenhum produto cadastrado ainda."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-[12px] bg-white">
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
      )}
    </div>
  );
}
