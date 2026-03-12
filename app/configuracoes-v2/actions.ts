"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/admin";

function parseMoneyInput(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDecimalInput(value: FormDataEntryValue | null): number {
  if (!value) return 0;
  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

// upsert garante que cria a linha se nao existir (tabela estava vazia)
export async function updateGoals(formData: FormData) {
  await supabaseAdmin
    .from("general_settings")
    .upsert({
      id: 1,
      store_name: "Brivia Modas",
      monthly_profit_goal_rs: parseMoneyInput(formData.get("monthly_profit_goal_rs")),
      cash_goal_rs: parseMoneyInput(formData.get("cash_goal_rs")),
      purchase_goal_rs: parseMoneyInput(formData.get("purchase_goal_rs")),
    });

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}

export async function updatePricing(formData: FormData) {
  await supabaseAdmin
    .from("general_settings")
    .upsert({
      id: 1,
      store_name: "Brivia Modas",
      default_markup_x: parseDecimalInput(formData.get("default_markup_x")),
      default_target_margin_pct: parseDecimalInput(formData.get("default_target_margin_pct")),
      default_taxes_pct: parseDecimalInput(formData.get("default_taxes_pct")),
      default_card_fee_pct: parseDecimalInput(formData.get("default_card_fee_pct")),
      default_marketing_pct: parseDecimalInput(formData.get("default_marketing_pct")),
      default_other_deductions_pct: parseDecimalInput(formData.get("default_other_deductions_pct")),
      default_packaging_rs: parseMoneyInput(formData.get("default_packaging_rs")),
      default_piece_expense_rs: parseMoneyInput(formData.get("default_piece_expense_rs")),
    });

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}

export async function addFixedCost(formData: FormData) {
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor_mensal = parseMoneyInput(formData.get("valor_mensal"));
  if (!descricao) return;

  const { data } = await supabaseAdmin
    .from("fixed_costs")
    .select("ordem")
    .order("ordem", { ascending: false })
    .limit(1)
    .single();

  const ordem = (data?.ordem ?? 0) + 1;

  await supabaseAdmin.from("fixed_costs").insert({
    descricao,
    valor_mensal,
    ativo: true,
    ordem,
  });

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}

export async function updateFixedCost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const descricao = String(formData.get("descricao") ?? "").trim();
  const valor_mensal = parseMoneyInput(formData.get("valor_mensal"));
  if (!id || !descricao) return;

  await supabaseAdmin
    .from("fixed_costs")
    .update({ descricao, valor_mensal })
    .eq("id", id);

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}

export async function toggleFixedCost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const ativo = formData.get("ativo") === "true";
  if (!id) return;

  await supabaseAdmin
    .from("fixed_costs")
    .update({ ativo: !ativo })
    .eq("id", id);

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}

export async function deleteFixedCost(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await supabaseAdmin.from("fixed_costs").delete().eq("id", id);

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}
