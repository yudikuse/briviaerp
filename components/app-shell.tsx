"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type AppShellProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

function IconHome() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
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

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" />
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

function BrandMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-[#0b0b0c]">
      BM
    </div>
  );
}

function SidebarItem({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={[
        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
        active
          ? "bg-white text-[#111827]"
          : "text-white/70 hover:bg-white/8 hover:text-white",
      ].join(" ")}
    >
      <span className={active ? "text-[#ff6a2b]" : "text-white/70"}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: <IconHome /> },
    { href: "/compras", label: "Compras", icon: <IconCart /> },
    { href: "/configuracoes", label: "Configurações", icon: <IconSettings /> },
    { href: "/vendas", label: "Vendas", icon: <IconBox /> },
    { href: "/relatorios", label: "Relatórios", icon: <IconChart /> },
  ];

  return (
    <div className="min-h-screen bg-[#eef1f5] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1500px] gap-5">
        <aside className="hidden w-[260px] shrink-0 rounded-[28px] bg-[#0a0a0b] p-5 text-white shadow-[0_20px_50px_rgba(0,0,0,0.18)] lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <BrandMark />
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                Brivia
              </p>
              <p className="text-lg font-semibold tracking-[0.12em]">Modas</p>
            </div>
          </div>

          <nav className="mt-5 space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                active={pathname === item.href}
              />
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">Brivia Modas ERP</p>
            <p className="mt-1 text-xs leading-5 text-white/55">
              Painel clean para compras, vendas, metas e indicadores.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-[32px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <header className="flex flex-col gap-4 border-b border-[#edf0f4] px-5 py-4 lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-[#f4f6f8] text-[#111827] lg:flex">
                  <SearchIcon />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-[30px] font-semibold tracking-[-0.04em] text-[#111827]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1 text-sm text-[#6b7280]">{subtitle}</p>
                  ) : null}
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

          <div className="px-5 py-5 lg:px-8 lg:py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
