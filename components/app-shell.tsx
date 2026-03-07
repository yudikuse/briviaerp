"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

const navItems = [
  { href: "/", label: "Dashboard", short: "Início" },
  { href: "/compras", label: "Compras", short: "Compras" },
  { href: "/configuracoes", label: "Configurações", short: "Config" },
  { href: "/vendas", label: "Vendas", short: "Vendas" },
  { href: "/relatorios", label: "Relatórios", short: "Relat." },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-72 shrink-0 border-r border-[var(--line)] bg-black/10 p-6 lg:flex lg:flex-col">
          <div className="rounded-[28px] border border-[var(--line)] bg-white/5 p-6 shadow-2xl shadow-black/10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[var(--line)] bg-[#2d2826] text-[22px] font-semibold text-[var(--gold-soft)]">
                BM
              </div>

              <div>
                <p className="brand-font text-2xl text-[var(--gold-soft)]">
                  BRIVIA
                </p>
                <p className="text-xs uppercase tracking-[0.45em] text-[var(--muted)]">
                  Modas
                </p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[var(--muted)]">
              ERP simples, elegante e direto ao ponto para compras, vendas,
              metas e resultado operacional.
            </p>
          </div>

          <nav className="mt-8 flex flex-1 flex-col gap-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl border px-4 py-3 text-sm transition ${
                    active
                      ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold-soft)]"
                      : "border-transparent bg-white/5 text-[var(--text)] hover:border-[var(--line)] hover:bg-white/8"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="rounded-2xl border border-[var(--line)] bg-white/5 p-4 text-sm text-[var(--muted)]">
            Passo 1 concluído = casca visual pronta.
            <br />
            Passo 2 = Supabase + tabelas + dados reais.
          </div>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[#332e2b]/92 px-4 py-4 backdrop-blur lg:px-8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-[var(--gold-soft)]">
                  Brivia Modas ERP
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
                <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
              </div>

              <div className="rounded-full border border-[var(--line)] bg-white/5 px-4 py-2 text-sm text-[var(--gold-soft)]">
                V1 • Base visual
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-8">
            {children}
          </main>

          <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--line)] bg-[#2d2826]/97 px-2 py-2 backdrop-blur lg:hidden">
            <div className="mx-auto grid max-w-2xl grid-cols-5 gap-2">
              {navItems.map((item) => {
                const active = isActive(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-2 py-3 text-center text-[11px] transition ${
                      active
                        ? "bg-[var(--gold)]/12 text-[var(--gold-soft)]"
                        : "bg-white/5 text-[var(--muted)]"
                    }`}
                  >
                    {item.short}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
