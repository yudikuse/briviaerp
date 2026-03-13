import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getNextCode } from "./actions";
import { PurchaseForm, StockTable } from "./_forms";
import type { StockItem } from "./_forms";

export const dynamic = "force-dynamic";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: ReactNode;
  children: ReactNode;
}) {
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

function MetricCard({ label, value, accent, hint }: {
  label: string; value: string; accent?: boolean; hint?: string;
}) {
  return (
    <div className={[
      "rounded-[14px] p-4 lg:rounded-[16px] lg:p-5",
      accent ? "bg-[#ff6a2b] text-white" : "bg-[#f6f7f9] text-[#111827]",
    ].join(" ")}>
      <p className={accent ? "text-[14px] font-medium text-white/80 lg:text-[15px]" : "text-[14px] font-medium text-[#667085] lg:text-[15px]"}>
        {label}
      </p>
      <p className="mt-3 text-[18px] font-semibold tracking-[-0.03em] lg:text-[24px]">{value}</p>
      {hint && <p className={accent ? "mt-2 text-[11px] text-white/70 lg:text-[12px]" : "mt-2 text-[11px] text-[#98a2b3] lg:text-[12px]"}>{hint}</p>}
    </div>
  );
}

export default async function ComprasPage() {
  const [
    { data: settings },
    { data: products },
    { data: purchaseEntries },
    { data: saleItems },
    nextCode,
  ] = await Promise.all([
    supabaseAdmin.from("general_settings").select("*").eq("id", 1).single(),
    supabaseAdmin.from("products").select("*").eq("ativo", true).order("created_at", { ascending: false }),
    supabaseAdmin.from("purchase_entries").select("product_id, quantidade"),
    supabaseAdmin.from("sale_items").select("product_id, quantidade"),
    getNextCode(),
  ]);

  // Calculate stock per product
  const purchased: Record<string, number> = {};
  const sold: Record<string, number> = {};
  for (const e of purchaseEntries ?? []) purchased[e.product_id] = (purchased[e.product_id] ?? 0) + e.quantidade;
  for (const s of saleItems ?? []) sold[s.product_id] = (sold[s.product_id] ?? 0) + s.quantidade;

  const stockItems: StockItem[] = (products ?? []).map(p => ({
    id: p.id,
    codigo: p.codigo,
    nome: p.nome,
    cor: p.cor,
    tamanho: p.tamanho,
    categoria: p.categoria,
    custo_unitario: Number(p.custo_unitario ?? 0),
    preco_atual: Number(p.preco_atual ?? 0),
    preco_sugerido: Number(p.preco_sugerido ?? 0),
    estoque_atual: (purchased[p.id] ?? 0) - (sold[p.id] ?? 0),
  }));

  // Summary metrics
  const totalItems = stockItems.length;
  const totalUnits = stockItems.reduce((s, i) => s + i.estoque_atual, 0);
  const stockValue = stockItems.reduce((s, i) => s + i.custo_unitario * Math.max(i.estoque_atual, 0), 0);
  const saleValue = stockItems.reduce((s, i) => s + i.preco_atual * Math.max(i.estoque_atual, 0), 0);
  const lowStock = stockItems.filter(i => i.estoque_atual > 0 && i.estoque_atual <= 3).length;

  return (
    <AppShell title="Compras" subtitle="Entrada de produtos e gestão de estoque">
      <div className="space-y-4 lg:space-y-5">

        {/* ── summary cards ── */}
        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Produtos" value={String(totalItems)} hint={`${totalUnits} unidades`} />
          <MetricCard label="Valor em estoque" value={brl(stockValue)} accent />
          <MetricCard label="Valor de venda" value={brl(saleValue)} hint="A preço atual" />
          <MetricCard label="Estoque baixo" value={String(lowStock)} hint="≤ 3 unidades" />
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          {/* ── purchase form ── */}
          <Section title="Registrar compra">
            <PurchaseForm nextCode={nextCode} settings={settings} />
          </Section>

          {/* ── summary panel ── */}
          <div className="space-y-4">
            <Section title="Como funciona">
              <div className="space-y-3 text-[13px] text-[#667085]">
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[10px] font-bold text-white">1</span>
                  <p>Preencha os dados do produto. O código é gerado automaticamente no formato BRV-001.</p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[10px] font-bold text-white">2</span>
                  <p>Os padrões de precificação são puxados de Configurações, mas podem ser editados por produto.</p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[10px] font-bold text-white">3</span>
                  <p>O preço de venda final é sugerido automaticamente. Você pode ajustá-lo livremente.</p>
                </div>
                <div className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#111827] text-[10px] font-bold text-white">4</span>
                  <p>Para adicionar mais unidades de um produto existente, use o mesmo código. O estoque será incrementado.</p>
                </div>
              </div>
            </Section>
          </div>
        </div>

        {/* ── stock table ── */}
        <Section
          title="Estoque atual"
          right={
            <div className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#667085]">
              {totalItems} produtos · {totalUnits} unidades
            </div>
          }
        >
          <StockTable items={stockItems} />
        </Section>

      </div>
    </AppShell>
  );
}
