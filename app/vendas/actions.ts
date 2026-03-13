"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type CartItem = {
  product_id: string;
  nome: string;
  codigo: string;
  cor: string | null;
  tamanho: string | null;
  // pricing snapshot from product
  custo_unitario: number;
  impostos_pct: number;
  taxa_cartao_pct: number;
  marketing_pct: number;
  outras_deducoes_pct: number;
  embalagem_rs: number;
  despesa_peca_rs: number;
  fornecedor: string | null;
  // sale-specific
  preco_tabela: number;       // preco_atual do produto (tabela)
  preco_final: number;        // pode ser editado pelo lojista na hora
  desconto_rs: number;        // diferença preco_tabela - preco_final * qty
  quantidade: number;
  total_item: number;         // preco_final * quantidade
  lucro_liquido: number;
};

function calcLucro(item: CartItem): number {
  const custoTotal = item.custo_unitario + item.embalagem_rs + item.despesa_peca_rs;
  const deducoesPct = (item.impostos_pct + item.taxa_cartao_pct + item.marketing_pct + item.outras_deducoes_pct) / 100;
  const deducoesRs = item.preco_final * deducoesPct;
  return (item.preco_final - custoTotal - deducoesRs) * item.quantidade;
}

export async function finalizeSale(formData: FormData) {
  const forma = String(formData.get("forma_pagamento") ?? "Pix");
  const cliente = String(formData.get("cliente") ?? "").trim() || null;
  const observacao = String(formData.get("observacao") ?? "").trim() || null;
  const entregaRs = parseFloat(String(formData.get("entrega_rs") ?? "0").replace(",", ".")) || 0;
  const itemsJson = String(formData.get("items_json") ?? "[]");

  let items: CartItem[] = [];
  try { items = JSON.parse(itemsJson); } catch { throw new Error("Erro ao processar itens."); }
  if (items.length === 0) throw new Error("Nenhum item na venda.");

  // Validate stock
  for (const item of items) {
    const { data: purch } = await supabaseAdmin.from("purchase_entries").select("quantidade").eq("product_id", item.product_id);
    const { data: sold } = await supabaseAdmin.from("sale_items").select("quantidade").eq("product_id", item.product_id);
    const estoque = (purch ?? []).reduce((s, r) => s + r.quantidade, 0) - (sold ?? []).reduce((s, r) => s + r.quantidade, 0);
    if (item.quantidade > estoque) throw new Error(`Estoque insuficiente: "${item.nome}" tem ${estoque} un., tentando vender ${item.quantidade}.`);
  }

  const subtotal = items.reduce((s, i) => s + i.preco_tabela * i.quantidade, 0);
  const totalDescontos = items.reduce((s, i) => s + i.desconto_rs, 0);
  const totalFinal = items.reduce((s, i) => s + i.total_item, 0) + entregaRs;

  const { data: sale, error: saleErr } = await supabaseAdmin
    .from("sales")
    .insert({
      forma_pagamento: forma,
      cliente,
      subtotal_rs: subtotal,
      desconto_total_rs: totalDescontos,
      acrescimo_total_rs: 0,
      entrega_rs: entregaRs,
      total_final_rs: totalFinal,
      observacao,
    })
    .select("id")
    .single();

  if (saleErr || !sale) throw new Error(saleErr?.message ?? "Erro ao registrar venda.");

  const saleItems = items.map((i) => ({
    sale_id: sale.id,
    product_id: i.product_id,
    descricao_produto: i.nome,
    cor_produto: i.cor,
    quantidade: i.quantidade,
    preco_tabela_rs: i.preco_tabela,
    desconto_rs: i.desconto_rs,
    acrescimo_rs: 0,
    acrescimo_pct: 0,
    preco_final_unitario_rs: i.preco_final,
    total_item_rs: i.total_item,
    custo_unitario_snapshot: i.custo_unitario,
    impostos_pct_snapshot: i.impostos_pct,
    taxa_cartao_pct_snapshot: i.taxa_cartao_pct,
    comissao_plataforma_pct_snapshot: 0,
    marketing_pct_snapshot: i.marketing_pct,
    outras_deducoes_pct_snapshot: i.outras_deducoes_pct,
    frete_subsidiado_rs_snapshot: 0,
    embalagem_rs_snapshot: i.embalagem_rs,
    custo_venda_extra_snapshot: i.despesa_peca_rs,
    lucro_liquido_rs: calcLucro(i),
  }));

  const { error: itemsErr } = await supabaseAdmin.from("sale_items").insert(saleItems);
  if (itemsErr) throw new Error(itemsErr.message);

  revalidatePath("/vendas");
  revalidatePath("/compras");
  revalidatePath("/relatorios");
}
