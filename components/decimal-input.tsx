import { revalidatePath } from "next/cache";
import type { ReactNode } from "react";
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

  const cleaned = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");

  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function moneyDefault(value: number | null | undefined) {
  if (!value || Number(value) === 0) return "";
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function decimalDefault(value: number | null | undefined) {
  if (value === null || value === undefined) return "";
  return String(value).replace(".", ",");
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

  revalidatePath("/configuracoes-v2");
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

  revalidatePath("/configuracoes-v2");
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
      <p
        className={
          accent
            ? "text-[14px] font-medium text-white/88 lg:text-[15px]"
            : "text-[14px] font-medium text-[#667085] lg:text-[15px]"
        }
      >
        {label}
      </p>

      <p className="mt-3 text-[18px] font-semibold tracking-[-0.03em] lg:text-[24px]">
        {value}
      </p>

      {hint ? (
        <p
          className={
            accent
              ? "mt-2 text-[11px] text-white/80 lg:text-[12px]"
              : "mt-2 text-[11px] text-[#98a2b3] lg:text-[12px]"
          }
        >
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function FieldBlock({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[12px] font-medium text-[#667085] lg:text-[13px]">
        {label}
      </p>
      {children}
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
                className="px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.1em] text-[#98a2b3]"
              >
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

const inputBaseClass =
  "h-[42px] w-full rounded-[10px] bg-white px-3 text-[14px] text-[#111827] outline-none ring-1 ring-[#e7ebf0] transition focus:ring-2 focus:ring-[#cfd8e3] lg:h-[44px]";

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

  const fixedCostRows = (fixedCosts ?? []).map((item) => ({
    label: item.descricao,
    value: `${brl(Number(item.valor_mensal ?? 0))} • ${
      item.ativo ? "Ativo" : "Inativo"
    }`,
  }));

  return (
    <AppShell title="Configurações" subtitle="">
      <div className="space-y-4 lg:space-y-5">
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Custos fixos" value={brl(totalFixedCosts)} />
          <MetricCard
            label="Meta operacional"
            value={brl(operationalGoal)}
            accent
          />
          <MetricCard
            label="Faturamento necessário"
            value={brl(requiredRevenue)}
            hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
          />
        </div>

        <div className="grid items-start gap-4 xl:grid-cols-[1.08fr_0.92fr]">
          <Section title="Padrões de precificação">
            <form action={updatePricing} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <FieldBlock label="Markup (x)">
                  <DecimalInput
                    name="default_markup_x"
                    defaultValue={decimalDefault(settings?.default_markup_x)}
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Margem alvo (%)">
                  <DecimalInput
                    name="default_target_margin_pct"
                    defaultValue={decimalDefault(settings?.default_target_margin_pct)}
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Impostos (%)">
                  <DecimalInput
                    name="default_taxes_pct"
                    defaultValue={decimalDefault(settings?.default_taxes_pct)}
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Taxa cartão (%)">
                  <DecimalInput
                    name="default_card_fee_pct"
                    defaultValue={decimalDefault(settings?.default_card_fee_pct)}
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Marketing (%)">
                  <DecimalInput
                    name="default_marketing_pct"
                    defaultValue={decimalDefault(settings?.default_marketing_pct)}
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Outras deduções (%)">
                  <DecimalInput
                    name="default_other_deductions_pct"
                    defaultValue={decimalDefault(
                      settings?.default_other_deductions_pct
                    )}
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Embalagem">
                  <MoneyInput
                    name="default_packaging_rs"
                    defaultValue={moneyDefault(settings?.default_packaging_rs)}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className={inputBaseClass}
                  />
                </FieldBlock>

                <FieldBlock label="Despesa por peça">
                  <MoneyInput
                    name="default_piece_expense_rs"
                    defaultValue={moneyDefault(
                      settings?.default_piece_expense_rs
                    )}
                    prefix="R$"
                    wrapperClassName="w-full"
                    className={inputBaseClass}
                  />
                </FieldBlock>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  className="h-[42px] rounded-[10px] bg-[#111827] px-4 text-[14px] font-medium text-white transition hover:opacity-90 lg:h-[44px]"
                >
                  Salvar padrões
                </button>
              </div>
            </form>
          </Section>

          <Section title="Objetivos">
            <form action={updateGoals} className="grid gap-3">
              <FieldBlock label="Meta de lucro">
                <MoneyInput
                  name="monthly_profit_goal_rs"
                  defaultValue={moneyDefault(monthlyProfitGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputBaseClass}
                />
              </FieldBlock>

              <FieldBlock label="Caixa">
                <MoneyInput
                  name="cash_goal_rs"
                  defaultValue={moneyDefault(cashGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputBaseClass}
                />
              </FieldBlock>

              <FieldBlock label="Compras">
                <MoneyInput
                  name="purchase_goal_rs"
                  defaultValue={moneyDefault(purchaseGoal)}
                  prefix="R$"
                  wrapperClassName="w-full"
                  className={inputBaseClass}
                />
              </FieldBlock>

              <div className="pt-1">
                <button
                  type="submit"
                  className="h-[42px] rounded-[10px] bg-[#111827] px-4 text-[14px] font-medium text-white transition hover:opacity-90 lg:h-[44px]"
                >
                  Salvar objetivos
                </button>
              </div>
            </form>
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
