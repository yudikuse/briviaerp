import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { VendasForm, SalesHistory } from "./_forms";
import type { ProductOption, SaleRecord } from "./_forms";

export const dynamic = "force-dynamic";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Section({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[14px] bg-[#f6f7f9] p-4 lg:rounded-[16px] lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-[#111827] lg:text-[19px]">
          {title}
        </h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, hint, accent }: {
  label: string; value: string; hint?: string; accent?: boolean;
}) {
  return (
    <div className={[
      "rounded-[14px] p-4 lg:rounded-[16px] lg:p-5",
      accent ? "bg-[#ff6a2b] text-white" : "bg-[#f6f7f9]",
    ].join(" ")}>
      <p className={`text-[14px] font-medium lg:text-[15px] ${accent ? "text-white/80" : "text-[#667085]"}`}>
        {label}
      </p>
      <p className={`mt-2 text-[20px] font-bold tracking-[-0.03em] lg:text-[22px] ${accent ? "text-white" : "text-[#111827]"}`}>
        {value}
      </p>
      {hint && (
        <p className={`mt-1 text-[11px] lg:text-[12px] ${accent ? "text-white/70" : "text-[#98a2b3]"}`}>
          {hint}
        </p>
      )}
    </div>
  );
}

export default async function VendasPage() {
  const [
    { data: products },
    { data: purchaseEntries },
    { data: saleItemsAll },
    { data: salesRaw },
  ] = await Promise.all([
    supabaseAdmin.from("products").select("*").eq("ativo", true).order("nome"),
    supabaseAdmin.from("purchase_entries").select("product_id, quantidade"),
    supabaseAdmin.from("sale_items").select("product_id, quantidade, sale_id"),
    supabaseAdmin
      .from("sales")
      .select("id, data_venda, forma_pagamento, cliente, total_final_rs, observacao")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  // stock per product
  const purchased: Record<string, number> = {};
  const sold: Record<string, number> = {};
  for (const e of purchaseEntries ?? []) purchased[e.product_id] = (purchased[e.product_id] ?? 0) + e.quantidade;
  for (const s of saleItemsAll ?? []) sold[s.product_id] = (sold[s.product_id] ?? 0) + s.quantidade;

  const productOptions: ProductOption[] = (products ?? [])
    .map((p) => ({
      id: p.id,
      codigo: p.codigo,
      nome: p.nome,
      cor: p.cor,
      tamanho: p.tamanho,
      categoria: p.categoria,
      fornecedor: p.fornecedor ?? null,
      custo_unitario: Number(p.custo_unitario ?? 0),
      impostos_pct: Number(p.impostos_pct ?? 0),
      taxa_cartao_pct: Number(p.taxa_cartao_pct ?? 0),
      marketing_pct: Number(p.marketing_pct ?? 0),
      outras_deducoes_pct: Number(p.outras_deducoes_pct ?? 0),
      embalagem_rs: Number(p.embalagem_rs ?? 0),
      despesa_peca_rs: Number(p.despesa_peca_rs ?? 0),
      preco_atual: Number(p.preco_atual ?? 0),
      estoque_atual: (purchased[p.id] ?? 0) - (sold[p.id] ?? 0),
    }))
    .filter((p) => p.estoque_atual > 0); // only show in-stock

  // items count + lucro per sale
  const itemsPerSale: Record<string, number> = {};
  const lucroPerSale: Record<string, number> = {};
  for (const si of saleItemsAll ?? []) {
    itemsPerSale[si.sale_id] = (itemsPerSale[si.sale_id] ?? 0) + si.quantidade;
    lucroPerSale[si.sale_id] = (lucroPerSale[si.sale_id] ?? 0) + Number(si.lucro_liquido_rs ?? 0);
  }

  const sales: SaleRecord[] = (salesRaw ?? []).map((s) => ({
    id: s.id,
    data_venda: String(s.data_venda).slice(0, 10),
    forma_pagamento: s.forma_pagamento,
    cliente: s.cliente,
    total_rs: Number(s.total_final_rs),
    lucro_liquido: lucroPerSale[s.id] ?? 0,
    margem_liquida: Number(s.total_final_rs) > 0 ? (lucroPerSale[s.id] ?? 0) / Number(s.total_final_rs) : 0,
    items_count: itemsPerSale[s.id] ?? 0,
  }));

  // Summary metrics (last 30 days)
  const hoje = new Date();
  const trintaDias = new Date(hoje);
  trintaDias.setDate(hoje.getDate() - 30);
  const trintaStr = trintaDias.toISOString().slice(0, 10);

  const salesMes = sales.filter((s) => s.data_venda >= trintaStr);
  const faturamentoMes = salesMes.reduce((s, v) => s + v.total_rs, 0); // total_rs is already mapped from total_final_rs
  const lucroMes = salesMes.reduce((s, v) => s + v.lucro_liquido, 0);
  const qtdVendas = salesMes.length;
  const ticketMedio = qtdVendas > 0 ? faturamentoMes / qtdVendas : 0;

  return (
    <AppShell title="Vendas" subtitle="Registro de vendas e baixa de estoque">
      <div className="space-y-4 lg:space-y-5">

        {/* ── summary cards ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Faturamento 30d" value={brl(faturamentoMes)} accent />
          <MetricCard label="Lucro 30d" value={brl(lucroMes)} hint={qtdVendas > 0 ? `${pct(lucroMes / faturamentoMes)} margem` : undefined} />
          <MetricCard label="Vendas 30d" value={String(qtdVendas)} />
          <MetricCard label="Ticket médio" value={brl(ticketMedio)} />
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          {/* ── sale form ── */}
          <Section title="Nova venda">
            <VendasForm products={productOptions} />
          </Section>

          {/* ── history ── */}
          <Section
            title="Histórico"
            right={
              <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#667085]">
                {sales.length} vendas
              </span>
            }
          >
            <SalesHistory sales={sales} />
          </Section>
        </div>

      </div>
    </AppShell>
  );
}

function pct(v: number) {
  return `${(v * 100).toFixed(1).replace(".", ",")}%`;
}
