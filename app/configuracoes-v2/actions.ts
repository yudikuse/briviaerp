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

export async function updateGoals(formData: FormData) {
  await supabaseAdmin
    .from("general_settings")
    .update({
      monthly_profit_goal_rs: parseMoneyInput(formData.get("monthly_profit_goal_rs")),
      cash_goal_rs: parseMoneyInput(formData.get("cash_goal_rs")),
      purchase_goal_rs: parseMoneyInput(formData.get("purchase_goal_rs")),
    })
    .eq("id", 1);

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}

export async function updatePricing(formData: FormData) {
  await supabaseAdmin
    .from("general_settings")
    .update({
      default_markup_x: parseDecimalInput(formData.get("default_markup_x")),
      default_target_margin_pct: parseDecimalInput(formData.get("default_target_margin_pct")),
      default_taxes_pct: parseDecimalInput(formData.get("default_taxes_pct")),
      default_card_fee_pct: parseDecimalInput(formData.get("default_card_fee_pct")),
      default_marketing_pct: parseDecimalInput(formData.get("default_marketing_pct")),
      default_other_deductions_pct: parseDecimalInput(formData.get("default_other_deductions_pct")),
      default_packaging_rs: parseMoneyInput(formData.get("default_packaging_rs")),
      default_piece_expense_rs: parseMoneyInput(formData.get("default_piece_expense_rs")),
    })
    .eq("id", 1);

  revalidatePath("/configuracoes-v2");
  revalidatePath("/configuracoes");
}
