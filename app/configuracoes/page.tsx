import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
import MoneyInput from "@/components/money-input";
import { Panel, StatCard } from "@/components/panel";
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

  const payload = {
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
  };

  await supabaseAdmin
    .from("general_settings")
    .update(payload)
    .eq("id", 1);

  revalidatePath("/configuracoes");
}

function decimalDefault(value: number | null | undefined) {
  if (!value || Number(value) === 0) return "";
  return String(value).replace(".", ",");
}

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

  const defaultMonthlyProfitGoal =
    monthlyProfitGoal > 0
      ? monthlyProfitGoal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const defaultCashGoal =
    cashGoal > 0
      ? cashGoal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const defaultPurchaseGoal =
    purchaseGoal > 0
      ? purchaseGoal.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const defaultPackaging =
    Number(settings?.default_packaging_rs ?? 0) > 0
      ? Number(settings?.default_packaging_rs).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  const defaultPieceExpense =
    Number(settings?.default_piece_expense_rs ?? 0) > 0
      ? Number(settings?.default_piece_expense_rs).toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "";

  return (
    <AppShell
      title="Configurações gerais"
      subtitle=""
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Panel title="Lista de custos fixos">
            <div className="space-y-2">
              {(fixedCosts ?? []).map((item) => {
                const defaultMoney =
                  Number(item.valor_mensal ?? 0) > 0
                    ? Number(item.valor_mensal).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : "";

                return (
                  <form
                    key={item.id}
                    action={updateFixedCost}
                    className="overflow-x-auto rounded-2xl border border-[var(--line)] bg-black/10 px-3 py-3"
                  >
                    <input type="hidden" name="id" value={item.id} />

                    <div className="flex min-w-[640px] items-center gap-3">
                      <div className="w-[140px] shrink-0 text-sm font-medium text-white">
                        {item.descricao}
                      </div>

                      <MoneyInput
                        name="valor_mensal"
                        defaultValue={defaultMoney}
                        prefix="R$"
                        wrapperClassName="min-w-0 flex-1"
                        className="h-10 w-full rounded-xl border border-[var(--line)] bg-[#f8f2ea] px-3 text-sm text-[var(--dark-text)] outline-none"
                      />

                      <label className="flex h-10 shrink-0 items-center gap-2 rounded-xl border border-[var(--line)] bg-white/5 px-3 text-sm text-[var(--gold-soft)]">
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
                        className="h-10 shrink-0 rounded-xl bg-[var(--gold)] px-4 text-sm font-semibold text-[#2d2826] transition hover:opacity-90"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                );
              })}

              {!fixedCosts?.length && (
                <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4 text-sm text-[var(--muted)]">
                  Nenhum custo fixo encontrado.
                </div>
              )}
            </div>
          </Panel>

          <Panel title="Padrões de precificação">
            <form action={updatePricing} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Markup (x)</span>
                  <input
                    name="default_markup_x"
                    defaultValue={decimalDefault(settings?.default_markup_x)}
                    inputMode="decimal"
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Margem alvo (%)</span>
                  <input
                    name="default_target_margin_pct"
                    defaultValue={decimalDefault(
                      settings?.default_target_margin_pct
                    )}
                    inputMode="decimal"
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Impostos (%)</span>
                  <input
                    name="default_taxes_pct"
                    defaultValue={decimalDefault(settings?.default_taxes_pct)}
                    inputMode="decimal"
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Taxa cartão (%)</span>
                  <input
                    name="default_card_fee_pct"
                    defaultValue={decimalDefault(settings?.default_card_fee_pct)}
                    inputMode="decimal"
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Marketing (%)</span>
                  <input
                    name="default_marketing_pct"
                    defaultValue={decimalDefault(settings?.default_marketing_pct)}
                    inputMode="decimal"
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Outras deduções (%)</span>
                  <input
                    name="default_other_deductions_pct"
                    defaultValue={decimalDefault(
                      settings?.default_other_deductions_pct
                    )}
                    inputMode="decimal"
                    className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Embalagem</span>
                  <MoneyInput
                    name="default_packaging_rs"
                    defaultValue={defaultPackaging}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="text-sm text-[var(--muted)]">Despesa por peça</span>
                  <MoneyInput
                    name="default_piece_expense_rs"
                    defaultValue={defaultPieceExpense}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="h-10 rounded-xl bg-[var(--gold)] px-4 text-sm font-semibold text-[#2d2826] transition hover:opacity-90"
              >
                Salvar padrões
              </button>
            </form>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel title="Objetivos">
            <form action={updateGoals} className="space-y-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm text-[var(--muted)]">
                  Meta de lucro
                </span>
                <MoneyInput
                  name="monthly_profit_goal_rs"
                  defaultValue={defaultMonthlyProfitGoal}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-[var(--muted)]">Caixa</span>
                <MoneyInput
                  name="cash_goal_rs"
                  defaultValue={defaultCashGoal}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm text-[var(--muted)]">Compras</span>
                <MoneyInput
                  name="purchase_goal_rs"
                  defaultValue={defaultPurchaseGoal}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className="h-12 w-full rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                />
              </label>

              <button
                type="submit"
                className="h-10 rounded-xl bg-[var(--gold)] px-4 text-sm font-semibold text-[#2d2826] transition hover:opacity-90"
              >
                Salvar objetivos
              </button>
            </form>
          </Panel>

          <Panel title="Indicadores calculados">
            <div className="grid gap-3">
              <StatCard
                label="Total custos fixos"
                value={brl(totalFixedCosts)}
              />
              <StatCard
                label="Meta operacional"
                value={brl(operationalGoal)}
              />
              <StatCard
                label="Faturamento necessário"
                value={brl(requiredRevenue)}
                hint={
                  marginBase > 0
                    ? `Base ${pct(marginBase)}`
                    : "Defina a margem alvo"
                }
              />
            </div>
          </Panel>

          {(settingsError || fixedCostsError) && (
            <Panel title="Erro">
              <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
                <p>{settingsError?.message ?? "general_settings OK"}</p>
                <p>{fixedCostsError?.message ?? "fixed_costs OK"}</p>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}
