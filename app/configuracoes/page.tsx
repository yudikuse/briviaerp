import { revalidatePath } from "next/cache";
import { AppShell } from "@/components/app-shell";
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

function textValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).replace(".", ",");
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm text-[var(--muted)]">{label}</span>
      <input
        readOnly
        value={textValue(value)}
        className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
      />
    </label>
  );
}

function parseMoneyInput(value: FormDataEntryValue | null) {
  if (!value) return 0;

  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const parsed = Number(normalized);
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
    <AppShell
      title="Configurações gerais"
      subtitle="Agora a página já está lendo os dados reais do Supabase"
    >
      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <Panel
            title="Custos fixos mensais"
            subtitle="Agora já vamos salvar alterações diretamente no banco."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ReadonlyField
                label="Total de custos fixos ativos"
                value={brl(totalFixedCosts)}
              />
              <ReadonlyField
                label="Quantidade de lançamentos"
                value={fixedCosts?.length ?? 0}
              />
            </div>
          </Panel>

          <Panel
            title="Lista de custos fixos"
            subtitle="Edite o valor e clique em salvar em cada linha"
          >
            <div className="space-y-3">
              {(fixedCosts ?? []).map((item) => (
                <form
                  key={item.id}
                  action={updateFixedCost}
                  className="rounded-2xl border border-[var(--line)] bg-black/10 p-4"
                >
                  <input type="hidden" name="id" value={item.id} />

                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0 md:w-1/3">
                      <p className="text-sm font-medium text-white">
                        {item.descricao}
                      </p>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        Ordem: {item.ordem}
                      </p>
                    </div>

                    <div className="grid gap-3 md:w-2/3 md:grid-cols-[1fr_auto_auto] md:items-end">
                      <label className="flex flex-col gap-2">
                        <span className="text-sm text-[var(--muted)]">
                          Valor mensal
                        </span>
                        <input
                          name="valor_mensal"
                          defaultValue={Number(item.valor_mensal ?? 0)
                            .toFixed(2)
                            .replace(".", ",")}
                          className="h-12 rounded-2xl border border-[var(--line)] bg-[#f8f2ea] px-4 text-sm text-[var(--dark-text)] outline-none"
                        />
                      </label>

                      <label className="flex h-12 items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/5 px-4 text-sm text-[var(--gold-soft)]">
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
                        className="h-12 rounded-2xl bg-[var(--gold)] px-5 text-sm font-semibold text-[#2d2826] transition hover:opacity-90"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </form>
              ))}

              {!fixedCosts?.length && (
                <div className="rounded-2xl border border-[var(--line)] bg-black/10 p-4 text-sm text-[var(--muted)]">
                  Nenhum custo fixo encontrado.
                </div>
              )}
            </div>
          </Panel>

          <Panel
            title="Padrões de precificação"
            subtitle="Valores vindos da tabela general_settings"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <ReadonlyField
                label="Markup padrão (x)"
                value={settings?.default_markup_x}
              />
              <ReadonlyField
                label="Margem alvo padrão (%)"
                value={pct(Number(settings?.default_target_margin_pct ?? 0))}
              />
              <ReadonlyField
                label="Impostos padrão (%)"
                value={pct(Number(settings?.default_taxes_pct ?? 0))}
              />
              <ReadonlyField
                label="Taxa cartão padrão (%)"
                value={pct(Number(settings?.default_card_fee_pct ?? 0))}
              />
              <ReadonlyField
                label="Marketing (%)"
                value={pct(Number(settings?.default_marketing_pct ?? 0))}
              />
              <ReadonlyField
                label="Outras deduções (%)"
                value={pct(Number(settings?.default_other_deductions_pct ?? 0))}
              />
              <ReadonlyField
                label="Embalagem padrão (R$)"
                value={brl(Number(settings?.default_packaging_rs ?? 0))}
              />
              <ReadonlyField
                label="Despesa por peça (R$)"
                value={brl(Number(settings?.default_piece_expense_rs ?? 0))}
              />
            </div>
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Objetivos"
            subtitle="Também puxados da tabela general_settings"
          >
            <div className="grid gap-4">
              <ReadonlyField
                label="Meta de lucro líquido mensal"
                value={brl(monthlyProfitGoal)}
              />
              <ReadonlyField
                label="Objetivo de dinheiro em caixa"
                value={brl(cashGoal)}
              />
              <ReadonlyField
                label="Objetivo para compras"
                value={brl(purchaseGoal)}
              />
              <ReadonlyField
                label="Ticket médio alvo"
                value={brl(Number(settings?.target_avg_ticket_rs ?? 0))}
              />
              <ReadonlyField
                label="Margem mínima desejada (%)"
                value={pct(Number(settings?.minimum_target_margin_pct ?? 0))}
              />
              <ReadonlyField
                label="Modo de precificação"
                value={settings?.pricing_mode ?? ""}
              />
            </div>
          </Panel>

          <Panel
            title="Indicadores calculados"
            subtitle="Resumo operacional em cima do banco real"
          >
            <div className="grid gap-3">
              <StatCard
                label="Total custos fixos"
                value={brl(totalFixedCosts)}
              />
              <StatCard
                label="Meta operacional do mês"
                value={brl(operationalGoal)}
              />
              <StatCard
                label="Faturamento necessário"
                value={brl(requiredRevenue)}
                hint={
                  marginBase > 0
                    ? `Usando margem base de ${pct(marginBase)}`
                    : "Defina uma margem mínima para calcular"
                }
              />
            </div>
          </Panel>

          {(settingsError || fixedCostsError) && (
            <Panel
              title="Erro de leitura"
              subtitle="Se aparecer algo aqui, me mande o print"
            >
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
