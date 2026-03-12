import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { PricingForm, GoalsForm } from "./_forms";

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
  right?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[14px] bg-[#f6f7f9] p-4 lg:rounded-[16px] lg:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-[16px] font-semibold tracking-[-0.025em] text-[#111827] lg:text-[19px]">
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
        "rounded-[14px] p-4 lg:rounded-[16px] lg:p-5",
        accent ? "bg-[#ff6a2b] text-white" : "bg-[#f6f7f9] text-[#111827]",
      ].join(" ")}
    >
      <p className={accent ? "text-[14px] font-medium text-white/88 lg:text-[15px]" : "text-[14px] font-medium text-[#667085] lg:text-[15px]"}>
        {label}
      </p>
      <p className="mt-3 text-[18px] font-semibold tracking-[-0.03em] lg:text-[24px]">
        {value}
      </p>
      {hint ? (
        <p className={accent ? "mt-2 text-[11px] text-white/80 lg:text-[12px]" : "mt-2 text-[11px] text-[#98a2b3] lg:text-[12px]"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function MobileList({ rows }: { rows: { label: string; value: string }[] }) {
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

function DesktopTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="hidden overflow-hidden rounded-[12px] bg-white lg:block">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#98a2b3]">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-t border-[#f1f4f8]">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-4 text-[14px] text-[#111827]">
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
  const operationalGoal = totalFixedCosts + monthlyProfitGoal + cashGoal + purchaseGoal;

  const marginBase =
    Number(settings?.minimum_target_margin_pct ?? 0) > 0
      ? Number(settings?.minimum_target_margin_pct ?? 0)
      : Number(settings?.default_target_margin_pct ?? 0);

  const requiredRevenue = marginBase > 0 ? operationalGoal / (marginBase / 100) : 0;

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

        <div className="grid items-start gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Section title="Padrões de precificação">
            <PricingForm settings={settings} />
          </Section>
          <Section title="Objetivos">
            <GoalsForm
              monthlyProfitGoal={monthlyProfitGoal}
              cashGoal={cashGoal}
              purchaseGoal={purchaseGoal}
            />
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
          <MobileList
            rows={(fixedCosts ?? []).map((item) => ({
              label: item.descricao,
              value: `${brl(Number(item.valor_mensal ?? 0))} • ${item.ativo ? "Ativo" : "Inativo"}`,
            }))}
          />
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
