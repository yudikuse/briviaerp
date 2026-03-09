import type { ReactNode } from "react";
import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import DecimalInput from "@/components/decimal-input";
import MoneyInput from "@/components/money-input";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function brl(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value || 0);
}

function pct(value: number) {
  return `${(value || 0).toFixed(2).replace(".", ",")}%`;
}

function parseMoneyInput(value: FormDataEntryValue | null) {
  if (!value) return 0;

  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDecimalInput(value: FormDataEntryValue | null) {
  if (!value) return 0;

  const raw = String(value).trim().replace(",", ".");
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

function decimalDefault(value: number | null | undefined) {
  if (!value || Number(value) === 0) return "";
  return String(value).replace(".", ",");
}

function moneyDefault(value: number | null | undefined) {
  if (!value || Number(value) === 0) return "";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

async function updateFixedCost(formData: FormData) {
  "use server";

  const id = String(formData.get("id") ?? "");
  const valorMensal = parseMoneyInput(formData.get("valor_mensal"));
  const ativo = formData.get("ativo") === "on";

  if (!id) return;

  await supabaseAdmin
    .from("fixed_costs")
    .update({
      valor_mensal: valorMensal,
      ativo,
    })
    .eq("id", id);

  revalidatePath("/configuracoes");
}

async function updateGoals(formData: FormData) {
  "use server";

  const monthlyProfitGoal = parseMoneyInput(
    formData.get("monthly_profit_goal_rs")
  );
  const cashGoal = parseMoneyInput(formData.get("cash_goal_rs"));
  const purchaseGoal = parseMoneyInput(formData.get("purchase_goal_rs"));

  await supabaseAdmin
    .from("general_settings")
    .update({
      monthly_profit_goal_rs: monthlyProfitGoal,
      cash_goal_rs: cashGoal,
      purchase_goal_rs: purchaseGoal,
    })
    .eq("id", 1);

  revalidatePath("/configuracoes");
}

async function updatePricing(formData: FormData) {
  "use server";

  await supabaseAdmin
    .from("general_settings")
    .update({
      default_markup_x: parseDecimalInput(formData.get("default_markup_x")),
      default_target_margin_pct: parseDecimalInput(
        formData.get("default_target_margin_pct")
      ),
      default_taxes_pct: parseDecimalInput(formData.get("default_taxes_pct")),
      default_card_fee_pct: parseDecimalInput(
        formData.get("default_card_fee_pct")
      ),
      default_marketing_pct: parseDecimalInput(
        formData.get("default_marketing_pct")
      ),
      default_other_deductions_pct: parseDecimalInput(
        formData.get("default_other_deductions_pct")
      ),
      default_packaging_rs: parseMoneyInput(formData.get("default_packaging_rs")),
      default_piece_expense_rs: parseMoneyInput(
        formData.get("default_piece_expense_rs")
      ),
    })
    .eq("id", 1);

  revalidatePath("/configuracoes");
}

function Block({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#eef0f3] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#101828]">
          {title}
        </h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Metric({
  label,
  value,
  accent = false,
  hint,
}: {
  label: string;
  value: string;
  accent?: boolean;
  hint?: string;
}) {
  return (
    <div
      className={[
        "rounded-[24px] border p-5",
        accent
          ? "border-[#ff6a2b] bg-[#ff6a2b] text-white shadow-[0_10px_24px_rgba(255,106,43,0.22)]"
          : "border-[#edf0f4] bg-white text-[#101828] shadow-[0_8px_22px_rgba(15,23,42,0.04)]",
      ].join(" ")}
    >
      <p className={accent ? "text-sm text-white/80" : "text-sm text-[#667085]"}>
        {label}
      </p>
      <p className="mt-3 text-[34px] font-semibold tracking-[-0.04em]">
        {value}
      </p>
      {hint ? (
        <p className={accent ? "mt-2 text-xs text-white/80" : "mt-2 text-xs text-[#98a2b3]"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-[#667085]">{children}</span>;
}

const inputClass =
  "h-12 w-full rounded-2xl border border-[#e7eaee] bg-[#f9fafb] px-4 text-sm text-[#111827] outline-none placeholder:text-[#98a2b3] focus:border-[#d0d5dd]";

const darkButtonClass =
  "h-12 rounded-2xl bg-[#101828] px-5 text-sm font-semibold text-white transition hover:opacity-90";

const orangeButtonClass =
  "h-12 rounded-2xl bg-[#ff6a2b] px-5 text-sm font-semibold text-white transition hover:opacity-90";

export default async function ConfiguracoesPage() {
  const [
    { data: settings, error: settingsError },
    { data: fixedCosts, error: fixedCostsError },
  ] = await Promise.all([
    supabaseAdmin.from("general_settings").select("*").eq("id", 1).single(),
    supabaseAdmin
      .from("fixed_costs")
      .select("id, descricao, valor_mensal, ativo, ordem")
      .order("ordem", { ascending: true }),
  ]);

  const totalFixedCosts = (fixedCosts ?? [])
    .filter((item) => item.ativo)
    .reduce((sum, item) => sum + Number(item.valor_mensal ?? 0), 0);

  const monthlyProfitGoal = Number(settings?.monthly_profit_goal_rs ?? 0);
  const cashGoal = Number(settings?.cash_goal_rs ?? 0);
  const purchaseGoal = Number(settings?.purchase_goal_rs ?? 0);

  const operationalGoal =
    totalFixedCosts + monthlyProfitGoal + cashGoal + purchaseGoal;

  const marginBase =
    Number(settings?.minimum_target_margin_pct ?? 0) > 0
      ? Number(settings?.minimum_target_margin_pct ?? 0)
      : Number(settings?.default_target_margin_pct ?? 0);

  const requiredRevenue =
    marginBase > 0 ? operationalGoal / (marginBase / 100) : 0;

  return (
    <AppShell title="Configurações gerais" subtitle="">
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Metric label="Custos fixos" value={brl(totalFixedCosts)} />
          <Metric label="Meta operacional" value={brl(operationalGoal)} accent />
          <Metric
            label="Faturamento necessário"
            value={brl(requiredRevenue)}
            hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Block title="Padrões de precificação">
            <form action={updatePricing} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="flex flex-col gap-2">
                  <Label>Markup (x)</Label>
                  <DecimalInput
                    name="default_markup_x"
                    defaultValue={decimalDefault(settings?.default_markup_x)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Margem alvo (%)</Label>
                  <DecimalInput
                    name="default_target_margin_pct"
                    defaultValue={decimalDefault(
                      settings?.default_target_margin_pct
                    )}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Impostos (%)</Label>
                  <DecimalInput
                    name="default_taxes_pct"
                    defaultValue={decimalDefault(settings?.default_taxes_pct)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Taxa cartão (%)</Label>
                  <DecimalInput
                    name="default_card_fee_pct"
                    defaultValue={decimalDefault(settings?.default_card_fee_pct)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Marketing (%)</Label>
                  <DecimalInput
                    name="default_marketing_pct"
                    defaultValue={decimalDefault(settings?.default_marketing_pct)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Outras deduções (%)</Label>
                  <DecimalInput
                    name="default_other_deductions_pct"
                    defaultValue={decimalDefault(
                      settings?.default_other_deductions_pct
                    )}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Embalagem</Label>
                  <MoneyInput
                    name="default_packaging_rs"
                    defaultValue={moneyDefault(settings?.default_packaging_rs)}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <Label>Despesa por peça</Label>
                  <MoneyInput
                    name="default_piece_expense_rs"
                    defaultValue={moneyDefault(
                      settings?.default_piece_expense_rs
                    )}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button type="submit" className={orangeButtonClass}>
                  Salvar padrões
                </button>
              </div>
            </form>
          </Block>

          <Block title="Objetivos">
            <form action={updateGoals} className="space-y-4">
              <label className="flex flex-col gap-2">
                <Label>Meta de lucro</Label>
                <MoneyInput
                  name="monthly_profit_goal_rs"
                  defaultValue={moneyDefault(monthlyProfitGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <Label>Caixa</Label>
                <MoneyInput
                  name="cash_goal_rs"
                  defaultValue={moneyDefault(cashGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <Label>Compras</Label>
                <MoneyInput
                  name="purchase_goal_rs"
                  defaultValue={moneyDefault(purchaseGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputClass}
                />
              </label>

              <button type="submit" className={darkButtonClass}>
                Salvar objetivos
              </button>
            </form>
          </Block>
        </div>

        <Block
          title="Custos fixos"
          action={
            <div className="rounded-full bg-[#f3f4f6] px-3 py-1 text-sm font-medium text-[#667085]">
              {fixedCosts?.length ?? 0} itens
            </div>
          }
        >
          <div className="overflow-hidden rounded-[24px] border border-[#edf0f4]">
            <div className="hidden grid-cols-[220px_minmax(0,1fr)_130px_120px] gap-4 bg-[#f8fafc] px-5 py-4 text-sm font-medium text-[#667085] lg:grid">
              <div>Item</div>
              <div>Valor mensal</div>
              <div>Status</div>
              <div>Ação</div>
            </div>

            <div className="divide-y divide-[#edf0f4] bg-white">
              {(fixedCosts ?? []).map((item) => (
                <form
                  key={item.id}
                  action={updateFixedCost}
                  className="grid gap-3 px-4 py-4 lg:grid-cols-[220px_minmax(0,1fr)_130px_120px] lg:items-center lg:px-5"
                >
                  <input type="hidden" name="id" value={item.id} />

                  <div className="text-sm font-medium text-[#111827]">
                    {item.descricao}
                  </div>

                  <MoneyInput
                    name="valor_mensal"
                    defaultValue={moneyDefault(item.valor_mensal)}
                    prefix="R$"
                    wrapperClassName="w-full min-w-0"
                    className={inputClass}
                  />

                  <label className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] px-3 text-sm text-[#4b5563]">
                    <input
                      type="checkbox"
                      name="ativo"
                      defaultChecked={item.ativo}
                      className="h-4 w-4"
                    />
                    Ativo
                  </label>

                  <button type="submit" className={darkButtonClass}>
                    Salvar
                  </button>
                </form>
              ))}

              {!fixedCosts?.length && (
                <div className="p-5 text-sm text-[#6b7280]">
                  Nenhum custo fixo encontrado.
                </div>
              )}
            </div>
          </div>
        </Block>

        {(settingsError || fixedCostsError) && (
          <Block title="Erro">
            <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{settingsError?.message ?? "general_settings OK"}</p>
              <p>{fixedCostsError?.message ?? "fixed_costs OK"}</p>
            </div>
          </Block>
        )}
      </div>
    </AppShell>
  );
}
