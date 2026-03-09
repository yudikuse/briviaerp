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

function Section({
  title,
  children,
  right,
}: {
  title: string;
  children: ReactNode;
  right?: ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#e8ebf2] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-[#111827]">
          {title}
        </h2>
        {right}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#e8ebf2] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.04)]">
      <p className="text-sm font-medium text-[#6b7280]">{label}</p>
      <p className="mt-2 text-[34px] font-semibold tracking-[-0.04em] text-[#111827]">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[#9ca3af]">{hint}</p> : null}
    </div>
  );
}

const inputClass =
  "h-12 w-full rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-4 text-sm text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#cbd5e1]";

const primaryButtonClass =
  "h-12 rounded-2xl bg-[#111827] px-5 text-sm font-semibold text-white transition hover:opacity-90";

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
      <div className="mx-auto max-w-7xl space-y-5 rounded-[36px] bg-[#f3f6fb] p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Custos fixos" value={brl(totalFixedCosts)} />
          <StatCard label="Meta operacional" value={brl(operationalGoal)} />
          <StatCard
            label="Faturamento necessário"
            value={brl(requiredRevenue)}
            hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <Section title="Objetivos">
            <form
              action={updateGoals}
              className="grid gap-4 md:grid-cols-[repeat(3,minmax(0,1fr))_160px] md:items-end"
            >
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#6b7280]">
                  Meta de lucro
                </span>
                <MoneyInput
                  name="monthly_profit_goal_rs"
                  defaultValue={moneyDefault(monthlyProfitGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#6b7280]">
                  Caixa
                </span>
                <MoneyInput
                  name="cash_goal_rs"
                  defaultValue={moneyDefault(cashGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputClass}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-[#6b7280]">
                  Compras
                </span>
                <MoneyInput
                  name="purchase_goal_rs"
                  defaultValue={moneyDefault(purchaseGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputClass}
                />
              </label>

              <button type="submit" className={primaryButtonClass}>
                Salvar objetivos
              </button>
            </form>
          </Section>

          <Section title="Padrões de precificação">
            <form action={updatePricing} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Markup (x)
                  </span>
                  <DecimalInput
                    name="default_markup_x"
                    defaultValue={decimalDefault(settings?.default_markup_x)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Margem alvo (%)
                  </span>
                  <DecimalInput
                    name="default_target_margin_pct"
                    defaultValue={decimalDefault(
                      settings?.default_target_margin_pct
                    )}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Impostos (%)
                  </span>
                  <DecimalInput
                    name="default_taxes_pct"
                    defaultValue={decimalDefault(settings?.default_taxes_pct)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Taxa cartão (%)
                  </span>
                  <DecimalInput
                    name="default_card_fee_pct"
                    defaultValue={decimalDefault(settings?.default_card_fee_pct)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Marketing (%)
                  </span>
                  <DecimalInput
                    name="default_marketing_pct"
                    defaultValue={decimalDefault(settings?.default_marketing_pct)}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Outras deduções (%)
                  </span>
                  <DecimalInput
                    name="default_other_deductions_pct"
                    defaultValue={decimalDefault(
                      settings?.default_other_deductions_pct
                    )}
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Embalagem
                  </span>
                  <MoneyInput
                    name="default_packaging_rs"
                    defaultValue={moneyDefault(settings?.default_packaging_rs)}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className={inputClass}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-[#6b7280]">
                    Despesa por peça
                  </span>
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
                <button type="submit" className={primaryButtonClass}>
                  Salvar padrões
                </button>
              </div>
            </form>
          </Section>
        </div>

        <Section
          title="Custos fixos"
          right={
            <div className="rounded-full bg-white px-3 py-1 text-sm font-medium text-[#6b7280] shadow-sm">
              {fixedCosts?.length ?? 0} itens
            </div>
          }
        >
          <div className="space-y-3">
            {(fixedCosts ?? []).map((item) => (
              <form
                key={item.id}
                action={updateFixedCost}
                className="rounded-[24px] border border-[#e8ebf2] bg-white p-4 shadow-[0_4px_14px_rgba(15,23,42,0.03)]"
              >
                <input type="hidden" name="id" value={item.id} />

                <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)_120px_110px] lg:items-center">
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

                  <label className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] px-3 text-sm text-[#4b5563]">
                    <input
                      type="checkbox"
                      name="ativo"
                      defaultChecked={item.ativo}
                      className="h-4 w-4"
                    />
                    Ativo
                  </label>

                  <button
                    type="submit"
                    className="h-12 rounded-2xl bg-[#111827] px-4 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            ))}

            {!fixedCosts?.length && (
              <div className="rounded-[24px] border border-[#e8ebf2] bg-white p-4 text-sm text-[#6b7280]">
                Nenhum custo fixo encontrado.
              </div>
            )}
          </div>
        </Section>

        {(settingsError || fixedCostsError) && (
          <Section title="Erro">
            <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{settingsError?.message ?? "general_settings OK"}</p>
              <p>{fixedCostsError?.message ?? "fixed_costs OK"}</p>
            </div>
          </Section>
        )}
      </div>
    </AppShell>
  );
}
