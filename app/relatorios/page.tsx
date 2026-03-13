import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// ─── helpers ──────────────────────────────────────────────────────────────────

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pct(v: number, decimals = 1) {
  return `${(v * 100).toFixed(decimals).replace(".", ",")}%`;
}

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function startOfPrevMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().slice(0, 10);
}

function endOfPrevMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 0).toISOString().slice(0, 10);
}

// ─── layout components ────────────────────────────────────────────────────────

function Section({ title, subtitle, children, accent }: {
  title: string; subtitle?: string; children: ReactNode; accent?: boolean;
}) {
  return (
    <section className={[
      "rounded-[14px] p-4 lg:rounded-[16px] lg:p-5",
      accent ? "bg-[#111827]" : "bg-[#f6f7f9]",
    ].join(" ")}>
      <div className="mb-4">
        <h2 className={`text-[16px] font-semibold tracking-[-0.025em] lg:text-[18px] ${accent ? "text-white" : "text-[#111827]"}`}>
          {title}
        </h2>
        {subtitle && <p className={`mt-0.5 text-[12px] lg:text-[13px] ${accent ? "text-white/50" : "text-[#98a2b3]"}`}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function MetricCard({ label, value, hint, accent, positive, negative, large }: {
  label: string; value: string; hint?: string;
  accent?: boolean; positive?: boolean; negative?: boolean; large?: boolean;
}) {
  const bg = accent ? "bg-[#ff6a2b]" : positive ? "bg-[#dcfce7]" : negative ? "bg-[#fee2e2]" : "bg-white";
  const textVal = accent ? "text-white" : positive ? "text-[#166534]" : negative ? "text-[#ef4444]" : "text-[#111827]";
  const textLabel = accent ? "text-white/80" : positive ? "text-[#16a34a]" : negative ? "text-[#ef4444]" : "text-[#667085]";
  const textHint = accent ? "text-white/60" : "text-[#98a2b3]";

  return (
    <div className={`rounded-[12px] p-4 ${bg}`}>
      <p className={`text-[12px] font-medium lg:text-[13px] ${textLabel}`}>{label}</p>
      <p className={`mt-2 font-bold tracking-[-0.03em] ${large ? "text-[22px] lg:text-[28px]" : "text-[18px] lg:text-[22px]"} ${textVal}`}>
        {value}
      </p>
      {hint && <p className={`mt-1 text-[11px] lg:text-[12px] ${textHint}`}>{hint}</p>}
    </div>
  );
}

function ProgressBar({ value, max, color = "#ff6a2b" }: { value: number; max: number; color?: string }) {
  const pctVal = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-[6px] w-full rounded-full bg-[#e5e7eb]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pctVal}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Row({ label, value, sub, bold }: { label: string; value: string; sub?: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-2 py-2.5 border-b border-[#f1f4f8] last:border-0">
      <div>
        <p className={`text-[13px] lg:text-[14px] ${bold ? "font-semibold text-[#111827]" : "text-[#111827]"}`}>{label}</p>
        {sub && <p className="text-[11px] text-[#98a2b3]">{sub}</p>}
      </div>
      <p className={`shrink-0 text-[13px] lg:text-[14px] ${bold ? "font-bold text-[#111827]" : "font-medium text-[#667085]"}`}>{value}</p>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function RelatoriosPage() {
  const mesAtual = startOfMonth();
  const mesAnteriorInicio = startOfPrevMonth();
  const mesAnteriorFim = endOfPrevMonth();

  const [
    { data: settings },
    { data: fixedCosts },
    { data: salesAll },
    { data: saleItemsAll },
    { data: products },
    { data: purchaseEntries },
  ] = await Promise.all([
    supabaseAdmin.from("general_settings").select("*").eq("id", 1).single(),
    supabaseAdmin.from("fixed_costs").select("*").eq("ativo", true),
    supabaseAdmin.from("sales").select("id, data_venda, total_final_rs, forma_pagamento, created_at"),
    supabaseAdmin.from("sale_items").select("sale_id, product_id, quantidade, total_item_rs, lucro_liquido_rs, descricao_produto, custo_unitario_snapshot"),
    supabaseAdmin.from("products").select("id, nome, codigo, cor, tamanho, categoria, preco_atual, custo_unitario, ativo").eq("ativo", true),
    supabaseAdmin.from("purchase_entries").select("product_id, quantidade"),
  ]);

  // ── stock ──
  const purchased: Record<string, number> = {};
  for (const e of purchaseEntries ?? []) purchased[e.product_id] = (purchased[e.product_id] ?? 0) + e.quantidade;

  const soldAll: Record<string, number> = {};
  for (const si of (saleItemsAll ?? []) as any[]) soldAll[si.product_id] = (soldAll[si.product_id] ?? 0) + si.quantidade;

  // ── filter sales by period ──
  const salesMes = (salesAll ?? []).filter(s => s.data_venda >= mesAtual);
  const salesMesAnterior = (salesAll ?? []).filter(s => s.data_venda >= mesAnteriorInicio && s.data_venda <= mesAnteriorFim);

  const saleIdsMes = new Set(salesMes.map(s => s.id));
  const saleIdsMesAnterior = new Set(salesMesAnterior.map(s => s.id));

  const itemsMes = ((saleItemsAll ?? []) as any[]).filter(si => saleIdsMes.has(si.sale_id));
  const itemsMesAnterior = ((saleItemsAll ?? []) as any[]).filter(si => saleIdsMesAnterior.has(si.sale_id));

  // ── KPIs mês atual ──
  const faturamento = salesMes.reduce((s, v) => s + Number(v.total_final_rs), 0);
  const lucro = itemsMes.reduce((s, i) => s + Number(i.lucro_liquido_rs ?? 0), 0);
  const qtdVendas = salesMes.length;
  const pecasVendidas = itemsMes.reduce((s, i) => s + i.quantidade, 0);
  const ticketMedio = qtdVendas > 0 ? faturamento / qtdVendas : 0;
  const margemLiquida = faturamento > 0 ? lucro / faturamento : 0;
  const cmv = itemsMes.reduce((s, i) => s + Number(i.custo_unitario_snapshot ?? 0) * i.quantidade, 0);

  // ── KPIs mês anterior (comparação) ──
  const fatAnterior = salesMesAnterior.reduce((s, v) => s + Number(v.total_final_rs), 0);
  const lucroAnterior = itemsMesAnterior.reduce((s, i) => s + Number(i.lucro_liquido_rs ?? 0), 0);

  const varFaturamento = fatAnterior > 0 ? (faturamento - fatAnterior) / fatAnterior : 0;
  const varLucro = lucroAnterior > 0 ? (lucro - lucroAnterior) / lucroAnterior : 0;

  // ── custos fixos ──
  const totalFixo = (fixedCosts ?? []).reduce((s, c) => s + Number(c.valor_mensal ?? 0), 0);

  // ── metas ──
  const metaLucro = Number(settings?.monthly_profit_goal_rs ?? 0);
  const metaFaturamento = Number(settings?.cash_goal_rs ?? 0);
  const minimoEquilibrio = totalFixo; // faturar ao menos os fixos
  const faltaMeta = Math.max(0, metaFaturamento - faturamento);
  const faltaEquilibrio = Math.max(0, minimoEquilibrio - faturamento);

  // ── ponto de equilíbrio em peças (estimativa) ──
  const precoMedioVenda = pecasVendidas > 0
    ? itemsMes.reduce((s, i) => s + Number(i.total_item_rs ?? 0), 0) / pecasVendidas
    : (products ?? []).reduce((s, p) => s + Number(p.preco_atual ?? 0), 0) / Math.max((products ?? []).length, 1);

  const pecasParaEquilibrio = precoMedioVenda > 0 ? Math.ceil(minimoEquilibrio / precoMedioVenda) : 0;

  // ── formas de pagamento ──
  const formaMap: Record<string, number> = {};
  for (const s of salesMes) {
    formaMap[s.forma_pagamento] = (formaMap[s.forma_pagamento] ?? 0) + Number(s.total_final_rs);
  }
  const formasSorted = Object.entries(formaMap).sort((a, b) => b[1] - a[1]);

  // ── produtos mais vendidos (mês) ──
  const prodMap: Record<string, { nome: string; qty: number; receita: number; lucro: number }> = {};
  for (const si of itemsMes) {
    const key = si.product_id;
    if (!prodMap[key]) prodMap[key] = { nome: si.descricao_produto ?? "—", qty: 0, receita: 0, lucro: 0 };
    prodMap[key].qty += si.quantidade;
    prodMap[key].receita += Number(si.total_item_rs ?? 0);
    prodMap[key].lucro += Number(si.lucro_liquido_rs ?? 0);
  }
  const topProdutos = Object.values(prodMap).sort((a, b) => b.receita - a.receita).slice(0, 8);

  // ── produtos parados (em estoque mas 0 vendas no mês) ──
  const produtosSemVenda = (products ?? []).filter(p => {
    const estoque = (purchased[p.id] ?? 0) - (soldAll[p.id] ?? 0);
    const vendasMes = itemsMes.filter(si => si.product_id === p.id).reduce((s: number, i: any) => s + i.quantidade, 0);
    return estoque > 0 && vendasMes === 0;
  }).slice(0, 8);

  // ── DRE simplificado ──
  const deducoes = faturamento - cmv - lucro; // impostos + cartão + outros
  const lucroBruto = faturamento - cmv;

  const hoje = new Date();
  const diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  const diaAtual = hoje.getDate();
  const projecao = diaAtual > 0 ? (faturamento / diaAtual) * diasNoMes : 0;

  return (
    <AppShell title="Relatórios" subtitle="Resultado operacional do mês">
      <div className="space-y-4 lg:space-y-5">

        {/* ── KPIs principais ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Faturamento mês"
            value={brl(faturamento)}
            hint={fatAnterior > 0 ? `${varFaturamento >= 0 ? "+" : ""}${pct(varFaturamento)} vs mês ant.` : undefined}
            accent
          />
          <MetricCard
            label="Lucro líquido"
            value={brl(lucro)}
            hint={lucroAnterior > 0 ? `${varLucro >= 0 ? "+" : ""}${pct(varLucro)} vs mês ant.` : undefined}
            positive={lucro > 0}
            negative={lucro < 0}
          />
          <MetricCard label="Margem líquida" value={pct(margemLiquida)} hint={`${pecasVendidas} peças vendidas`} />
          <MetricCard label="Ticket médio" value={brl(ticketMedio)} hint={`${qtdVendas} vendas`} />
        </div>

        {/* ── metas + DRE ── */}
        <div className="grid gap-4 lg:grid-cols-2">

          {/* metas */}
          <Section title="Metas do mês">
            <div className="space-y-4">
              {metaFaturamento > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#667085]">Meta de faturamento</span>
                    <span className="font-semibold text-[#111827]">{brl(faturamento)} / {brl(metaFaturamento)}</span>
                  </div>
                  <ProgressBar value={faturamento} max={metaFaturamento} color="#ff6a2b" />
                  <p className="text-[11px] text-[#98a2b3]">
                    {pct(metaFaturamento > 0 ? faturamento / metaFaturamento : 0)} atingido
                    {faltaMeta > 0 && ` · faltam ${brl(faltaMeta)}`}
                  </p>
                </div>
              )}

              {metaLucro > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#667085]">Meta de lucro</span>
                    <span className="font-semibold text-[#111827]">{brl(lucro)} / {brl(metaLucro)}</span>
                  </div>
                  <ProgressBar value={lucro} max={metaLucro} color="#22c55e" />
                  <p className="text-[11px] text-[#98a2b3]">
                    {pct(metaLucro > 0 ? lucro / metaLucro : 0)} atingido
                  </p>
                </div>
              )}

              <div className="rounded-[12px] bg-white p-4 space-y-3">
                <Row label="Ponto de equilíbrio" value={brl(minimoEquilibrio)} sub="Mínimo para cobrir fixos" />
                <Row label="Já faturado" value={brl(faturamento)} />
                <Row
                  label={faltaEquilibrio > 0 ? "Falta para equilibrar" : "Acima do equilíbrio"}
                  value={faltaEquilibrio > 0 ? brl(faltaEquilibrio) : `+${brl(faturamento - minimoEquilibrio)}`}
                  bold
                />
                {pecasParaEquilibrio > 0 && (
                  <Row label="Peças necessárias (est.)" value={`${pecasParaEquilibrio} peças`} sub="Para cobrir os custos fixos" />
                )}
                {projecao > 0 && (
                  <Row label="Projeção fim do mês" value={brl(projecao)} sub={`Base: ${diaAtual} dias corridos`} />
                )}
              </div>
            </div>
          </Section>

          {/* DRE */}
          <Section title="Resultado (DRE simplificado)">
            <div className="rounded-[12px] bg-white p-4 space-y-0">
              <Row label="Faturamento bruto" value={brl(faturamento)} />
              <Row label="CMV (custo das mercadorias)" value={`− ${brl(cmv)}`} />
              <Row label="Lucro bruto" value={brl(lucroBruto)} bold />
              <Row label="Deduções (impostos, cartão...)" value={`− ${brl(Math.max(0, deducoes))}`} />
              <Row label="Custos fixos" value={`− ${brl(totalFixo)}`} />
              <Row
                label="Resultado líquido"
                value={brl(lucro - totalFixo)}
                bold
              />
            </div>

            {/* formas de pagamento */}
            {formasSorted.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-[12px] font-semibold uppercase tracking-[0.07em] text-[#98a2b3]">
                  Formas de pagamento
                </p>
                <div className="rounded-[12px] bg-white p-3 space-y-2">
                  {formasSorted.map(([forma, valor]) => (
                    <div key={forma} className="space-y-1">
                      <div className="flex justify-between text-[13px]">
                        <span className="text-[#667085]">{forma}</span>
                        <span className="font-medium text-[#111827]">
                          {brl(valor)} · {pct(faturamento > 0 ? valor / faturamento : 0)}
                        </span>
                      </div>
                      <ProgressBar value={valor} max={faturamento} color="#6366f1" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Section>
        </div>

        {/* ── produtos mais vendidos + parados ── */}
        <div className="grid gap-4 lg:grid-cols-2">

          <Section title="Mais vendidos no mês" subtitle={topProdutos.length === 0 ? "Nenhuma venda ainda" : `${topProdutos.length} produtos`}>
            {topProdutos.length === 0 ? (
              <p className="rounded-[12px] bg-white px-4 py-6 text-center text-[13px] text-[#98a2b3]">
                Registre vendas para ver aqui.
              </p>
            ) : (
              <div className="rounded-[12px] bg-white">
                {topProdutos.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-[#f1f4f8] px-4 py-3 last:border-0">
                    <span className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#f6f7f9] text-[12px] font-bold text-[#667085]">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#111827]">{p.nome}</p>
                      <p className="text-[11px] text-[#98a2b3]">{p.qty} un. · {brl(p.receita)}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-[13px] font-semibold ${p.lucro >= 0 ? "text-[#16a34a]" : "text-[#ef4444]"}`}>
                        {brl(p.lucro)}
                      </p>
                      <p className="text-[10px] text-[#98a2b3]">lucro</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Estoque parado" subtitle="Com estoque mas sem venda no mês">
            {produtosSemVenda.length === 0 ? (
              <p className="rounded-[12px] bg-white px-4 py-6 text-center text-[13px] text-[#98a2b3]">
                {(products ?? []).length === 0 ? "Nenhum produto cadastrado." : "Todos os produtos venderam este mês! 🎉"}
              </p>
            ) : (
              <div className="rounded-[12px] bg-white">
                {produtosSemVenda.map((p) => {
                  const estoque = (purchased[p.id] ?? 0) - (soldAll[p.id] ?? 0);
                  const valorParado = estoque * Number(p.custo_unitario ?? 0);
                  return (
                    <div key={p.id} className="flex items-center gap-3 border-b border-[#f1f4f8] px-4 py-3 last:border-0">
                      <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full bg-[#fef3c7] text-[14px]">
                        ⚠️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#111827]">{p.nome}</p>
                        <p className="text-[11px] text-[#98a2b3]">
                          {[p.cor, p.tamanho].filter(Boolean).join(" · ")} · {estoque} un.
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[13px] font-medium text-[#d97706]">{brl(valorParado)}</p>
                        <p className="text-[10px] text-[#98a2b3]">capital parado</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* ── custos fixos ── */}
        {(fixedCosts ?? []).length > 0 && (
          <Section title="Custos fixos ativos" subtitle={`Total: ${brl(totalFixo)}/mês`}>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {(fixedCosts ?? []).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-[10px] bg-white px-3 py-3">
                  <p className="text-[13px] text-[#111827]">{c.descricao}</p>
                  <p className="text-[13px] font-semibold text-[#667085]">{brl(Number(c.valor_mensal))}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>
    </AppShell>
  );
}
