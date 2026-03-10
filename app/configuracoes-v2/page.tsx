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
    <section className="rounded-[14px] bg-[#f6f7f9] p-4 lg:rounded-[16px] lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold tracking-[-0.02em] text-[#111827] lg:text-[17px]">
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
        "rounded-[14px] p-4 lg:p-5",
        accent ? "bg-[#ff6a2b] text-white" : "bg-[#f6f7f9] text-[#111827]",
      ].join(" ")}
    >
      <p className={accent ? "text-[12px] text-white/80" : "text-[12px] text-[#667085]"}>
        {label}
      </p>
      <p className="mt-2 text-[18px] font-semibold tracking-[-0.03em] lg:text-[24px]">
        {value}
      </p>
      {hint ? (
        <p className={accent ? "mt-1 text-[11px] text-white/80" : "mt-1 text-[11px] text-[#98a2b3]"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function ValueField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-[#667085] lg:text-[13px]">{label}</p>
      <div className="flex min-h-[40px] items-center rounded-[10px] bg-white px-3 text-[14px] text-[#111827]">
        {value}
      </div>
    </div>
  );
}

function MobileList({
  rows,
}: {
  rows: { label: string; value: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-[12px] bg-white lg:hidden">
      {rows.map((row, idx) => (
        <div
          key={row.label}
          className={[
            "flex items-start justify-between gap-4 px-4 py-3",
            idx !== rows.length - 1 ? "border-b border-[#edf0f4]" : "",
          ].join(" ")}
        >
          <div className="text-[14px] text-[#111827]">{row.label}</div>
          <div className="shrink-0 text-right text-[14px] font-medium text-[#111827]">
            {row.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function DesktopTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] bg-white lg:block">
      <table className="w-full border-collapse">
        <thead>
          <tr>
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
            <tr key={idx} className={idx !== rows.length - 1 ? "border-b border-[#f1f4f8]" : ""}>
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-3 py-3 text-[14px] text-[#111827]">
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

  const pricingRows = [
    {
      label: "Markup (x)",
      value: String(settings?.default_markup_x ?? 0).replace(".", ","),
    },
    {
      label: "Margem alvo (%)",
      value: pct(Number(settings?.default_target_margin_pct ?? 0)),
    },
    {
      label: "Impostos (%)",
      value: pct(Number(settings?.default_taxes_pct ?? 0)),
    },
    {
      label: "Taxa cartão (%)",
      value: pct(Number(settings?.default_card_fee_pct ?? 0)),
    },
    {
      label: "Marketing (%)",
      value: pct(Number(settings?.default_marketing_pct ?? 0)),
    },
    {
      label: "Outras deduções (%)",
      value: pct(Number(settings?.default_other_deductions_pct ?? 0)),
    },
    {
      label: "Embalagem",
      value: brl(Number(settings?.default_packaging_rs ?? 0)),
    },
    {
      label: "Despesa por peça",
      value: brl(Number(settings?.default_piece_expense_rs ?? 0)),
    },
  ];

  const fixedCostRows = (fixedCosts ?? []).map((item) => ({
    label: item.descricao,
    value: `${brl(Number(item.valor_mensal ?? 0))} • ${item.ativo ? "Ativo" : "Inativo"}`,
  }));

  return (
    <AppShell title="Configurações" subtitle="">
      <div className="space-y-4 lg:space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Custos fixos" value={brl(totalFixedCosts)} />
          <MetricCard label="Meta operacional" value={brl(operationalGoal)} accent />
          <MetricCard
            label="Faturamento necessário"
            value={brl(requiredRevenue)}
            hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <Section title="Padrões de precificação">
            <MobileList rows={pricingRows} />
            <DesktopTable
              headers={["Campo", "Valor"]}
              rows={pricingRows.map((row) => [row.label, row.value])}
            />
          </Section>

          <Section title="Objetivos">
            <div className="grid gap-3">
              <ValueField label="Meta de lucro" value={brl(monthlyProfitGoal)} />
              <ValueField label="Caixa" value={brl(cashGoal)} />
              <ValueField label="Compras" value={brl(purchaseGoal)} />
            </div>
          </Section>
        </div>

        <Section
          title="Custos fixos"
          right={
            <div className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-[#667085]">
              {fixedCosts?.length ?? 0} itens
            </div>
          }
        >
          <MobileList rows={fixedCostRows} />
          <DesktopTable
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
