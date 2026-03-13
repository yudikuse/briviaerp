"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { finalizeSale } from "./actions";
import type { CartItem } from "./actions";

// ─── helpers ──────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v: number) {
  return `${(v * 100).toFixed(1).replace(".", ",")}%`;
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

const inputBase =
  "h-[52px] w-full rounded-[10px] bg-white px-3 text-[16px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] transition focus:ring-2 focus:ring-[#cfd8e3] lg:h-[48px] lg:text-[15px]";

// ─── types ────────────────────────────────────────────────────────────────────

export type ProductOption = {
  id: string;
  codigo: string;
  nome: string;
  cor: string | null;
  tamanho: string | null;
  categoria: string | null;
  fornecedor: string | null;
  custo_unitario: number;
  impostos_pct: number;
  taxa_cartao_pct: number;
  marketing_pct: number;
  outras_deducoes_pct: number;
  embalagem_rs: number;
  despesa_peca_rs: number;
  preco_atual: number;
  estoque_atual: number;
};

export type SaleRecord = {
  id: string;
  data_venda: string;
  forma_pagamento: string;
  cliente: string | null;
  total_rs: number;
  lucro_liquido: number;
  margem_liquida: number;
  items_count: number;
};

// ─── product search ───────────────────────────────────────────────────────────

function ProductSearch({
  products,
  onAdd,
}: {
  products: ProductOption[];
  onAdd: (p: ProductOption) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = query.length >= 1
    ? products.filter(
        (p) =>
          p.nome.toLowerCase().includes(query.toLowerCase()) ||
          p.codigo.toLowerCase().includes(query.toLowerCase()) ||
          (p.cor ?? "").toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : [];

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const stockColor = (n: number) =>
    n <= 0 ? "text-[#ef4444]" : n <= 3 ? "text-[#d97706]" : "text-[#16a34a]";

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar por nome, código ou cor..."
        className={inputBase}
      />

      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[320px] overflow-y-auto rounded-[12px] border border-[#e7ebf0] bg-white shadow-lg">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onAdd(p);
                setQuery("");
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-[#f6f7f9] active:bg-[#edf0f4]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-[#98a2b3]">{p.codigo}</span>
                  {p.tamanho && (
                    <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5 text-[11px] font-medium text-[#667085]">
                      {p.tamanho}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[14px] font-semibold text-[#111827]">{p.nome}</p>
                {p.cor && <p className="text-[12px] text-[#98a2b3]">{p.cor}</p>}
              </div>
              <div className="ml-3 shrink-0 text-right">
                <p className="text-[14px] font-semibold text-[#111827]">{brl(p.preco_atual)}</p>
                <p className={`text-[11px] font-medium ${stockColor(p.estoque_atual)}`}>
                  {p.estoque_atual} un.
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {open && query.length >= 1 && filtered.length === 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-[12px] border border-[#e7ebf0] bg-white p-4 shadow-lg">
          <p className="text-center text-[14px] text-[#98a2b3]">Nenhum produto encontrado.</p>
        </div>
      )}
    </div>
  );
}

// ─── cart item row ────────────────────────────────────────────────────────────

function CartItemRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (id: string, changes: Partial<CartItem>) => void;
  onRemove: (id: string) => void;
}) {
  const [editingPrice, setEditingPrice] = useState(false);
  const [editingQty, setEditingQty] = useState(false);
  const [priceStr, setPriceStr] = useState(
    item.preco_final.toLocaleString("pt-BR", { minimumFractionDigits: 2 })
  );

  const margem =
    item.preco_final > 0
      ? (item.preco_final - item.custo_unitario) / item.preco_final
      : 0;

  const margemColor =
    margem < 0.1 ? "text-[#ef4444]" : margem < 0.2 ? "text-[#d97706]" : "text-[#16a34a]";

  function commitPrice() {
    const v = parseFloat(priceStr.replace(/\./g, "").replace(",", ".")) || item.preco_final;
    const desconto = Math.max(0, item.preco_final * item.quantidade - v * item.quantidade);
    onUpdate(item.product_id, {
      preco_final: v,
      desconto_rs: desconto,
      total_item: v * item.quantidade,
    });
    setEditingPrice(false);
  }

  function changeQty(delta: number) {
    const newQty = Math.max(1, item.quantidade + delta);
    onUpdate(item.product_id, {
      quantidade: newQty,
      total_item: item.preco_final * newQty,
    });
  }

  return (
    <div className="border-b border-[#f1f4f8] p-4 last:border-0">
      {/* product info */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-[#111827] leading-tight">{item.nome}</p>
          <div className="mt-0.5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-[#98a2b3]">{item.codigo}</span>
            {item.tamanho && <span className="text-[11px] text-[#98a2b3]">{item.tamanho}</span>}
            {item.cor && <span className="text-[11px] text-[#98a2b3]">{item.cor}</span>}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.product_id)}
          className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[9px] text-[16px] text-[#98a2b3] hover:bg-[#fee2e2] hover:text-[#ef4444]"
        >
          ✕
        </button>
      </div>

      {/* price + qty + total */}
      <div className="mt-3 flex items-center gap-3 flex-wrap">
        {/* qty stepper */}
        <div className="flex items-center gap-0 rounded-[10px] ring-1 ring-[#e7ebf0]">
          <button type="button" onClick={() => changeQty(-1)}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-l-[10px] text-[18px] text-[#667085] hover:bg-[#f6f7f9] active:bg-[#edf0f4]">
            −
          </button>
          <span className="flex h-[44px] w-[36px] items-center justify-center text-[15px] font-semibold text-[#111827]">
            {item.quantidade}
          </span>
          <button type="button" onClick={() => changeQty(+1)}
            className="flex h-[44px] w-[44px] items-center justify-center rounded-r-[10px] text-[18px] text-[#111827] hover:bg-[#f6f7f9] active:bg-[#edf0f4]">
            +
          </button>
        </div>

        {/* unit price */}
        <div className="flex-1 min-w-[100px]">
          <p className="text-[10px] uppercase tracking-wide text-[#98a2b3]">Preço unit.</p>
          {editingPrice ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                inputMode="numeric"
                value={priceStr}
                onChange={e => setPriceStr(e.target.value.replace(/[^0-9,.]/g, ""))}
                onBlur={commitPrice}
                onKeyDown={e => e.key === "Enter" && commitPrice()}
                autoFocus
                className="h-[36px] w-[110px] rounded-[8px] px-2 text-[15px] text-[#111827] outline-none ring-1 ring-[#cfd8e3]"
              />
            </div>
          ) : (
            <button type="button" onClick={() => setEditingPrice(true)}
              className="flex items-center gap-1 mt-0.5 group">
              <span className="text-[14px] font-semibold text-[#111827]">{brl(item.preco_final)}</span>
              <span className="text-[11px] text-[#98a2b3] group-hover:text-[#111827]">✏️</span>
            </button>
          )}
        </div>

        {/* total + margem */}
        <div className="text-right">
          <p className="text-[15px] font-bold text-[#111827]">{brl(item.total_item)}</p>
          <p className={`text-[11px] font-medium ${margemColor}`}>
            {pct(margem)} margem
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── VendasForm ───────────────────────────────────────────────────────────────

export function VendasForm({ products }: { products: ProductOption[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [forma, setForma] = useState("Pix");
  const [cliente, setCliente] = useState("");
  const [observacao, setObservacao] = useState("");
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formas = ["Pix", "Dinheiro", "Débito", "Crédito à vista", "Crédito 2x", "Crédito 3x+"];

  function addToCart(p: ProductOption) {
    setCart((prev) => {
      const exists = prev.find((i) => i.product_id === p.id);
      if (exists) {
        const newQty = exists.quantidade + 1;
        return prev.map((i) =>
          i.product_id === p.id
            ? { ...i, quantidade: newQty, total_item: i.preco_final * newQty }
            : i
        );
      }
      const lucroUnit = p.preco_atual - p.custo_unitario - p.embalagem_rs - p.despesa_peca_rs
        - p.preco_atual * (p.impostos_pct + p.taxa_cartao_pct + p.marketing_pct + p.outras_deducoes_pct) / 100;
      return [
        ...prev,
        {
          product_id: p.id,
          nome: p.nome,
          codigo: p.codigo,
          cor: p.cor,
          tamanho: p.tamanho,
          fornecedor: p.fornecedor,
          custo_unitario: p.custo_unitario,
          impostos_pct: p.impostos_pct,
          taxa_cartao_pct: p.taxa_cartao_pct,
          marketing_pct: p.marketing_pct,
          outras_deducoes_pct: p.outras_deducoes_pct,
          embalagem_rs: p.embalagem_rs,
          despesa_peca_rs: p.despesa_peca_rs,
          preco_tabela: p.preco_atual,
          preco_final: p.preco_atual,
          desconto_rs: 0,
          quantidade: 1,
          total_item: p.preco_atual,
          lucro_liquido: lucroUnit,
        },
      ];
    });
  }

  function updateItem(product_id: string, changes: Partial<CartItem>) {
    setCart((prev) => prev.map((i) => (i.product_id === product_id ? { ...i, ...changes } : i)));
  }

  function removeItem(product_id: string) {
    setCart((prev) => prev.filter((i) => i.product_id !== product_id));
  }

  // totals
  const subtotal = cart.reduce((s, i) => s + i.preco_tabela * i.quantidade, 0);
  const totalDescontos = cart.reduce((s, i) => s + i.desconto_rs, 0);
  const totalRs = cart.reduce((s, i) => s + i.total_item, 0);
  const custoTotal = cart.reduce((s, i) => s + (i.custo_unitario + i.embalagem_rs + i.despesa_peca_rs) * i.quantidade, 0);
  const lucroLiquido = cart.reduce((s, i) => s + i.lucro_liquido, 0);
  const margemLiquida = totalRs > 0 ? lucroLiquido / totalRs : 0;

  async function handleFinalize() {
    if (cart.length === 0) { setError("Adicione pelo menos um produto."); return; }
    setError(null);
    const fd = new FormData();
    fd.set("forma_pagamento", forma);
    fd.set("cliente", cliente);
    fd.set("observacao", observacao);
    fd.set("items_json", JSON.stringify(cart));
    startTransition(() => { finalizeSale(fd); });
    await new Promise(r => setTimeout(r, 1000));
    setCart([]);
    setCliente("");
    setObservacao("");
    setSavedAt(nowDateTime());
  }

  return (
    <div className="space-y-4">
      {/* search */}
      <div className="space-y-2">
        <p className="text-[13px] font-medium text-[#667085]">Buscar produto</p>
        <ProductSearch products={products} onAdd={addToCart} />
      </div>

      {/* cart */}
      {cart.length > 0 ? (
        <div className="rounded-[14px] bg-[#f6f7f9]">
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <p className="text-[13px] font-semibold text-[#111827]">
              Carrinho · {cart.length} {cart.length === 1 ? "item" : "itens"}
            </p>
            <button type="button" onClick={() => setCart([])}
              className="text-[12px] text-[#98a2b3] hover:text-[#ef4444]">
              Limpar tudo
            </button>
          </div>
          <div className="rounded-[12px] bg-white">
            {cart.map((item) => (
              <CartItemRow key={item.product_id} item={item} onUpdate={updateItem} onRemove={removeItem} />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-[14px] border-2 border-dashed border-[#e7ebf0] px-4 py-8 text-center">
          <p className="text-[14px] text-[#98a2b3]">Busque um produto para adicionar ao carrinho.</p>
        </div>
      )}

      {/* payment + details */}
      <div className="space-y-3">
        <p className="text-[13px] font-medium text-[#667085]">Forma de pagamento</p>
        <div className="flex flex-wrap gap-2">
          {formas.map((f) => (
            <button key={f} type="button" onClick={() => setForma(f)}
              className={[
                "h-[44px] rounded-[10px] px-4 text-[14px] font-medium transition",
                forma === f
                  ? "bg-[#111827] text-white"
                  : "bg-[#f6f7f9] text-[#667085] hover:bg-[#edf0f4]",
              ].join(" ")}>
              {f}
            </button>
          ))}
        </div>

        <input
          type="text"
          value={cliente}
          onChange={e => setCliente(e.target.value)}
          placeholder="Cliente (opcional)"
          className={inputBase}
        />
        <input
          type="text"
          value={observacao}
          onChange={e => setObservacao(e.target.value)}
          placeholder="Observação (opcional)"
          className={inputBase}
        />
      </div>

      {/* summary */}
      {cart.length > 0 && (
        <div className="rounded-[14px] bg-[#f6f7f9] p-4 space-y-2">
          <div className="flex justify-between text-[14px]">
            <span className="text-[#667085]">Subtotal</span>
            <span className="text-[#111827]">{brl(subtotal)}</span>
          </div>
          {totalDescontos > 0 && (
            <div className="flex justify-between text-[14px]">
              <span className="text-[#667085]">Descontos</span>
              <span className="text-[#ef4444]">− {brl(totalDescontos)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[#e7ebf0] pt-2 text-[16px] font-bold">
            <span className="text-[#111827]">Total</span>
            <span className="text-[#111827]">{brl(totalRs)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#98a2b3]">Custo</span>
            <span className="text-[#98a2b3]">{brl(custoTotal)}</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#98a2b3]">Lucro líquido</span>
            <span className={lucroLiquido >= 0 ? "text-[#16a34a] font-medium" : "text-[#ef4444] font-medium"}>
              {brl(lucroLiquido)} · {pct(margemLiquida)}
            </span>
          </div>
        </div>
      )}

      {/* error */}
      {error && (
        <div className="rounded-[10px] bg-[#fee2e2] px-4 py-3 text-[13px] text-[#ef4444]">
          {error}
        </div>
      )}

      {/* finalize */}
      <button
        type="button"
        onClick={handleFinalize}
        disabled={pending || cart.length === 0}
        className="h-[56px] w-full rounded-[12px] bg-[#111827] text-[16px] font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
      >
        {pending ? "Finalizando..." : `Finalizar venda · ${brl(totalRs)}`}
      </button>

      {savedAt && (
        <p className="text-center text-[13px] text-[#22c55e]">✓ Venda registrada em {savedAt}</p>
      )}
    </div>
  );
}

// ─── SalesHistory ─────────────────────────────────────────────────────────────

const FORMA_ICON: Record<string, string> = {
  Pix: "⚡",
  Dinheiro: "💵",
  Débito: "💳",
  "Crédito à vista": "💳",
  "Crédito 2x": "💳",
  "Crédito 3x+": "💳",
};

export function SalesHistory({ sales }: { sales: SaleRecord[] }) {
  if (sales.length === 0) {
    return (
      <div className="rounded-[12px] bg-white px-4 py-8 text-center text-[14px] text-[#98a2b3]">
        Nenhuma venda registrada ainda.
      </div>
    );
  }

  return (
    <div className="rounded-[12px] bg-white">
      {sales.map((s) => {
        const data = new Date(s.data_venda + "T12:00:00");
        const dd = String(data.getDate()).padStart(2, "0");
        const mm = String(data.getMonth() + 1).padStart(2, "0");
        const margemColor =
          s.margem_liquida < 0.1
            ? "text-[#ef4444]"
            : s.margem_liquida < 0.2
            ? "text-[#d97706]"
            : "text-[#16a34a]";

        return (
          <div key={s.id} className="flex items-center gap-3 border-b border-[#f1f4f8] px-4 py-4 last:border-0">
            <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[10px] bg-[#f6f7f9] text-[20px]">
              {FORMA_ICON[s.forma_pagamento] ?? "💳"}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-semibold text-[#111827]">{brl(s.total_rs)}</span>
                <span className="rounded-full bg-[#f1f4f8] px-2 py-0.5 text-[11px] text-[#667085]">
                  {s.forma_pagamento}
                </span>
                {s.items_count > 0 && (
                  <span className="text-[11px] text-[#98a2b3]">
                    {s.items_count} {s.items_count === 1 ? "item" : "itens"}
                  </span>
                )}
              </div>
              {s.cliente && (
                <p className="mt-0.5 text-[12px] text-[#98a2b3]">{s.cliente}</p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[12px] text-[#98a2b3]">{dd}/{mm}</p>
              <p className={`text-[12px] font-medium ${margemColor}`}>
                {pct(s.margem_liquida)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
