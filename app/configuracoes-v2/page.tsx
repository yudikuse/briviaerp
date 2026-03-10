import Link from "next/link";
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

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3 4 7l8 4 8-4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19V5" />
      <path d="M10 19V10" />
      <path d="M16 19V7" />
      <path d="M22 19V13" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 17H9" />
      <path d="M18 17V11a6 6 0 1 0-12 0v6l-2 2h16l-2-2Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function NavItem({
  href,
  label,
  active,
  icon,
}: {
  href: string;
  label: string;
  active?: boolean;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-white text-[#111827]"
          : "text-white/70 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span className={active ? "text-[#ff6a2b]" : "text-white/70"}>{icon}</span>
      <span>{label}</span>
    </Link>
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
        "rounded-[24px] p-6",
        accent
          ? "bg-[#ff6a2b] text-white shadow-[0_14px_32px_rgba(255,106,43,0.24)]"
          : "border border-[#edf0f4] bg-white text-[#111827]",
      ].join(" ")}
    >
      <p className={accent ? "text-sm text-white/80" : "text-sm text-[#667085]"}>{label}</p>
      <p className="mt-4 text-[34px] font-semibold tracking-[-0.04em]">{value}</p>
      {hint ? (
        <p className={accent ? "mt-2 text-xs text-white/80" : "mt-2 text-xs text-[#98a2b3]"}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[#edf0f4] bg-white p-6">
      <h2 className="text-[18px] font-semibold tracking-[-0.03em] text-[#101828]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
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
      <span className="text-sm font-medium text-[#667085]">{label}</span>
      <div className="flex h-12 items-center rounded-2xl border border-[#e6e9ee] bg-[#f9fafb] px-4 text-sm text-[#111827]">
        {value}
      </div>
    </label>
  );
}

export default async function ConfiguracoesV2Page() {
  const [
    { data: settings },
    { data: fixedCosts },
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
    <div className="min-h-screen bg-[#eef1f5] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] gap-5">
        <aside className="hidden w-[260px] shrink-0 rounded-[30px] bg-[#050607] p-6 text-white shadow-[0_25px_60px_rgba(0,0,0,0.20)] lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 pb-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#111827]">
              BM
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Brivia
              </p>
              <p className="text-[17px] font-semibold tracking-[0.08em] text-white">
                Modas
              </p>
            </div>
          </div>

          <nav className="mt-6 space-y-2">
            <NavItem href="/" label="Dashboard" icon={<IconHome />} />
            <NavItem href="/compras" label="Compras" icon={<IconCart />} />
            <NavItem href="/configuracoes-v2" label="Configurações" icon={<IconSettings />} active />
            <NavItem href="/vendas" label="Vendas" icon={<IconBox />} />
            <NavItem href="/relatorios" label="Relatórios" icon={<IconChart />} />
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">Template V2</p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Rota nova para montar o dashboard no estilo correto.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-[32px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <header className="flex flex-col gap-4 border-b border-[#edf0f4] px-5 py-4 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f6f8] text-[#111827]">
                  <SearchIcon />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-[30px] font-semibold tracking-[-0.04em] text-[#111827]">
                    Configurações
                  </h1>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-12 min-w-[260px] items-center gap-3 rounded-2xl border border-[#eceff3] bg-[#fafbfc] px-4 text-[#9aa3af]">
                  <SearchIcon />
                  <span className="text-sm">Buscar</span>
                </div>

                <div className="flex h-12 items-center gap-2 rounded-2xl border border-[#eceff3] bg-[#fafbfc] px-4 text-sm text-[#4b5563]">
                  <CalendarIcon />
                  <span>Configurações</span>
                </div>

                <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#eceff3] bg-[#fafbfc] text-[#6b7280]">
                  <BellIcon />
                </button>

                <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#eceff3] bg-[#fafbfc] px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6a2b] text-sm font-semibold text-white">
                    B
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-[#111827]">Brivia Modas</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 px-5 py-5 lg:px-8 lg:py-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <MetricCard label="Custos fixos" value={brl(totalFixedCosts)} />
              <MetricCard label="Meta operacional" value={brl(operationalGoal)} accent />
              <MetricCard
                label="Faturamento necessário"
                value={brl(requiredRevenue)}
                hint={marginBase > 0 ? `Base ${pct(marginBase)}` : "Defina a margem alvo"}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Section title="Padrões de precificação">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
              </Section>

              <Section title="Objetivos">
                <div className="space-y-4">
                  <ReadonlyField label="Meta de lucro" value={brl(monthlyProfitGoal)} />
                  <ReadonlyField label="Caixa" value={brl(cashGoal)} />
                  <ReadonlyField label="Compras" value={brl(purchaseGoal)} />
                </div>
              </Section>
            </div>

            <Section title="Custos fixos">
              <div className="overflow-hidden rounded-[24px] border border-[#edf0f4]">
                <div className="hidden grid-cols-[220px_1fr_120px] gap-4 bg-[#f8fafc] px-5 py-4 text-sm font-medium text-[#667085] lg:grid">
                  <div>Item</div>
                  <div>Valor mensal</div>
                  <div>Status</div>
                </div>

                <div className="divide-y divide-[#edf0f4] bg-white">
                  {(fixedCosts ?? []).map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 px-4 py-4 lg:grid-cols-[220px_1fr_120px] lg:items-center lg:px-5"
                    >
                      <div className="text-sm font-medium text-[#111827]">
                        {item.descricao}
                      </div>
                      <div className="text-sm text-[#111827]">
                        {brl(Number(item.valor_mensal ?? 0))}
                      </div>
                      <div className="text-sm text-[#667085]">
                        {item.ativo ? "Ativo" : "Inativo"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
}
