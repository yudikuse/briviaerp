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

function Section({
  title,
  right,
  children,
}: {
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[14px] border border-[#e9edf3] bg-white p-4 lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em] text-[#111827] lg:text-[18px]">
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
        "rounded-[14px] border p-4 lg:p-5",
        accent
          ? "border-[#ff6a2b] bg-[#ff6a2b] text-white"
          : "border-[#e9edf3] bg-white text-[#111827]",
      ].join(" ")}
    >
      <p className={accent ? "text-[12px] text-white/80" : "text-[12px] text-[#667085]"}>
        {label}
      </p>
      <p className="mt-3 text-[22px] font-semibold tracking-[-0.03em] lg:text-[28px]">
        {value}
      </p>
      {hint ? (
        <p className={accent ? "mt-2 text-[11px] text-white/80" : "mt-2 text-[11px] text-[#98a2b3]"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ValuePill({
  value,
}: {
  value: string;
}) {
  return (
    <div className="flex min-h-[40px] items-center rounded-[10px] border border-[#e6eaf0] bg-[#f8fafc] px-3 text-[14px] text-[#111827]">
      {value}
    </div>
  );
}

function CompactTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[620px] w-full border-collapse">
        <thead>
          <tr className="border-b border-[#edf0f4]">
            {headers.map((header) => (
              <th
                key={header}
                className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-[#98a2b3]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-[#f1f4f8] last:border-b-0">
              {row.map((cell, cellIdx) => (
                <td
                  key={cellIdx}
                  className="px-3 py-3 text-[14px] text-[#111827]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      <div className="space-y-4 lg:space-y-5">
        <div className="grid gap-3 lg:grid-cols-3">
          <MetricCard label="Custos fixos" value={brl(totalFixedCosts)} />
          <MetricCard label="Meta operacional" value={brl(operationalGoal)} accent />
          <MetricCard
            label="Faturamento necessário"
            value={brl(requiredRevenue)}
            hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Section title="Padrões de precificação">
            <CompactTable
              headers={["Campo", "Valor"]}
              rows={[
                ["Markup (x)", String(settings?.default_markup_x ?? 0).replace(".", ",")],
                ["Margem alvo (%)", pct(Number(settings?.default_target_margin_pct ?? 0))],
                ["Impostos (%)", pct(Number(settings?.default_taxes_pct ?? 0))],
                ["Taxa cartão (%)", pct(Number(settings?.default_card_fee_pct ?? 0))],
                ["Marketing (%)", pct(Number(settings?.default_marketing_pct ?? 0))],
                ["Outras deduções (%)", pct(Number(settings?.default_other_deductions_pct ?? 0))],
                ["Embalagem", brl(Number(settings?.default_packaging_rs ?? 0))],
                ["Despesa por peça", brl(Number(settings?.default_piece_expense_rs ?? 0))],
              ]}
            />
          </Section>

          <Section title="Objetivos">
            <div className="grid gap-3">
              <div>
                <p className="mb-2 text-[13px] font-medium text-[#667085]">Meta de lucro</p>
                <ValuePill value={brl(monthlyProfitGoal)} />
              </div>
              <div>
                <p className="mb-2 text-[13px] font-medium text-[#667085]">Caixa</p>
                <ValuePill value={brl(cashGoal)} />
              </div>
              <div>
                <p className="mb-2 text-[13px] font-medium text-[#667085]">Compras</p>
                <ValuePill value={brl(purchaseGoal)} />
              </div>
            </div>
          </Section>
        </div>

        <Section
          title="Custos fixos"
          right={
            <div className="rounded-full bg-[#f3f4f6] px-3 py-1 text-[12px] font-medium text-[#667085]">
              {fixedCosts?.length ?? 0} itens
            </div>
          }
        >
          <CompactTable
            headers={["Item", "Valor mensal", "Status"]}
            rows={(fixedCosts ?? []).map((item) => [
              item.descricao,
              brl(Number(item.valor_mensal ?? 0)),
              item.ativo ? "Ativo" : "Inativo",
            ])}
          />
        </Section>
      </div>
    </AppShell>
  );
}
