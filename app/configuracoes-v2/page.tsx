import { AppShell } from "@/components/app-shell";
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

function Panel({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[22px] border border-[#e9edf3] bg-white p-5 shadow-[0_6px_18px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-[#111827]">
          {title}
        </h2>
        {right}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  accent,
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
        "rounded-[20px] border p-5",
        accent
          ? "border-[#ff6a2b] bg-[#ff6a2b] text-white shadow-[0_10px_24px_rgba(255,106,43,0.20)]"
          : "border-[#e9edf3] bg-white text-[#111827]",
      ].join(" ")}
    >
      <p className={accent ? "text-[13px] text-white/80" : "text-[13px] text-[#667085]"}>
        {label}
      </p>
      <p className="mt-3 text-[30px] font-semibold tracking-[-0.04em]">
        {value}
      </p>
      {hint ? (
        <p className={accent ? "mt-2 text-[12px] text-white/80" : "mt-2 text-[12px] text-[#98a2b3]"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ReadonlyField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[13px] font-medium text-[#667085]">{label}</span>
      <div className="flex h-11 items-center rounded-[14px] border border-[#e6eaf0] bg-[#f8fafc] px-4 text-[14px] text-[#111827]">
        {value}
      </div>
    </label>
  );
}

export default async function ConfiguracoesV2Page() {
  const [{ data: settings }, { data: fixedCosts }] = await Promise.all([
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
    <AppShell title="Configurações" subtitle="">
      <div className="space-y-5">
        <div className="grid gap-4 xl:grid-cols-3">
          <MetricCard label="Custos fixos" value={brl(totalFixedCosts)} />
          <MetricCard label="Meta operacional" value={brl(operationalGoal)} accent />
          <MetricCard
            label="Faturamento necessário"
            value={brl(requiredRevenue)}
            hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Panel title="Padrões de precificação">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <ReadonlyField
                label="Markup (x)"
                value={String(settings?.default_markup_x ?? 0).replace(".", ",")}
              />
              <ReadonlyField
                label="Margem alvo (%)"
                value={pct(Number(settings?.default_target_margin_pct ?? 0))}
              />
              <ReadonlyField
                label="Impostos (%)"
                value={pct(Number(settings?.default_taxes_pct ?? 0))}
              />
              <ReadonlyField
                label="Taxa cartão (%)"
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
                label="Embalagem"
                value={brl(Number(settings?.default_packaging_rs ?? 0))}
              />
              <ReadonlyField
                label="Despesa por peça"
                value={brl(Number(settings?.default_piece_expense_rs ?? 0))}
              />
            </div>
          </Panel>

          <Panel title="Objetivos">
            <div className="space-y-3">
              <ReadonlyField label="Meta de lucro" value={brl(monthlyProfitGoal)} />
              <ReadonlyField label="Caixa" value={brl(cashGoal)} />
              <ReadonlyField label="Compras" value={brl(purchaseGoal)} />
            </div>
          </Panel>
        </div>

        <Panel
          title="Custos fixos"
          right={
            <div className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-medium text-[#667085]">
              {fixedCosts?.length ?? 0} itens
            </div>
          }
        >
          <div className="overflow-hidden rounded-[18px] border border-[#edf0f4]">
            <div className="hidden grid-cols-[220px_1fr_120px] gap-4 bg-[#f8fafc] px-5 py-3 text-[12px] font-medium uppercase tracking-[0.08em] text-[#98a2b3] lg:grid">
              <div>Item</div>
              <div>Valor mensal</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-[#edf0f4] bg-white">
              {(fixedCosts ?? []).map((item) => (
                <div
                  key={item.id}
                  className="grid gap-2 px-4 py-4 lg:grid-cols-[220px_1fr_120px] lg:items-center lg:px-5"
                >
                  <div className="text-[14px] font-medium text-[#111827]">
                    {item.descricao}
                  </div>
                  <div className="text-[14px] text-[#111827]">
                    {brl(Number(item.valor_mensal ?? 0))}
                  </div>
                  <div className="text-[13px] text-[#667085]">
                    {item.ativo ? "Ativo" : "Inativo"}
                  </div>
                </div>
              ))}

              {!fixedCosts?.length && (
                <div className="p-5 text-[14px] text-[#6b7280]">
                  Nenhum custo fixo encontrado.
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
