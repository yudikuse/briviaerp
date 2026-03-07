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

export default async function ConfiguracoesPage() {
  const [{ data: settings, error: settingsError }, { data: fixedCosts, error: fixedCostsError }] =
    await Promise.all([
      supabaseAdmin
        .from("general_settings")
        .select("*")
        .eq("id", 1)
        .single(),
      supabaseAdmin
        .from("fixed_costs")
        .select("valor_mensal, ativo"),
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
            subtitle="Leitura do banco conectada. No próximo passo vamos salvar alterações."
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
                label="Comissão plataforma (%)"
                value={pct(Number(settings?.default_platform_fee_pct ?? 0))}
              />
              <ReadonlyField
                label="Marketing (%)"
                value={pct(Number(settings?.default_marketing_pct ?? 0))}
              />
              <ReadonlyField
                label="Comissão vendedor (%)"
                value={pct(Number(settings?.default_seller_commission_pct ?? 0))}
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
                label="Frete subsidiado (R$)"
                value={brl(Number(settings?.default_subsidized_shipping_rs ?? 0))}
              />
              <ReadonlyField
                label="Despesa por peça (R$)"
                value={brl(Number(settings?.default_piece_expense_rs ?? 0))}
              />
              <ReadonlyField
                label="Custo extra de venda (R$)"
                value={brl(Number(settings?.default_extra_sale_cost_rs ?? 0))}
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
