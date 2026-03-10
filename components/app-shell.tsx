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
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 7l8 4 8-4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5" />
      <path d="M10 19V10" />
      <path d="M16 19V7" />
      <path d="M22 19V13" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[15px] w-[15px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 17H9" />
      <path d="M18 17V11a6 6 0 1 0-12 0v6l-2 2h16l-2-2Z" />
    </svg>
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
        "flex items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14px] font-medium transition",
        active
          ? "bg-white text-[#111827]"
          : "text-white/75 hover:bg-white/5 hover:text-white",
      ].join(" ")}
    >
      <span className={active ? "text-[#ff6a2b]" : "text-white/75"}>{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/", label: "Dashboard", icon: <IconHome /> },
    { href: "/compras", label: "Compras", icon: <IconCart /> },
    { href: "/configuracoes-v2", label: "Configurações", icon: <IconSettings /> },
    { href: "/vendas", label: "Vendas", icon: <IconBox /> },
    { href: "/relatorios", label: "Relatórios", icon: <IconChart /> },
  ];

  return (
    <div className="min-h-screen bg-[#f3f4f6] lg:p-4">
      <div className="mx-auto flex min-h-screen max-w-[1460px] gap-4 lg:min-h-[calc(100vh-2rem)]">
        <aside className="hidden w-[220px] shrink-0 rounded-[18px] bg-[#050607] px-4 py-5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-white/8 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-white text-[14px] font-semibold text-[#111827]">
              BM
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.28em] text-white/42">
                Brivia
              </p>
              <p className="text-[16px] font-semibold text-white">Modas</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                active={pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))}
              />
            ))}
          </nav>

          <div className="mt-auto rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
            <p className="text-[12px] font-medium text-white">Brivia ERP</p>
            <p className="mt-1 text-[11px] leading-5 text-white/52">
              Painel operacional.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-white lg:rounded-[18px] lg:shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <header className="border-b border-[#edf0f4] px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-[#111827] lg:text-[24px]">
                  {title}
                </h1>
                {subtitle ? (
                  <p className="mt-1 hidden text-[13px] text-[#667085] lg:block">
                    {subtitle}
                  </p>
                ) : null}
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="flex h-10 min-w-[240px] items-center gap-3 rounded-[12px] border border-[#eceff3] bg-[#fafbfc] px-3 text-[#98a2b3]">
                  <SearchIcon />
                  <span className="text-[14px]">Buscar</span>
                </div>

                <button className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#eceff3] bg-[#fafbfc] text-[#6b7280]">
                  <BellIcon />
                </button>

                <div className="flex h-10 items-center gap-3 rounded-[12px] border border-[#eceff3] bg-[#fafbfc] px-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6a2b] text-[13px] font-semibold text-white">
                    B
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#111827]">Brivia Modas</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-4 lg:px-6 lg:py-5">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
