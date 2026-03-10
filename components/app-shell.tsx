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
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20h14V9.5" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 7l8 4 8-4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5" />
      <path d="M10 19V10" />
      <path d="M16 19V7" />
      <path d="M22 19V13" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 17H9" />
      <path d="M18 17V11a6 6 0 1 0-12 0v6l-2 2h16l-2-2Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[16px] w-[16px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4" />
      <path d="M8 3v4" />
      <path d="M3 10h18" />
    </svg>
  );
}

function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-white text-[15px] font-semibold text-[#111827]">
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
        "flex items-center gap-3 rounded-[16px] px-4 py-3 text-[15px] font-medium transition",
        active
          ? "bg-white text-[#111827]"
          : "text-white/72 hover:bg-white/6 hover:text-white",
      ].join(" ")}
    >
      <span className={active ? "text-[#ff6a2b]" : "text-white/72"}>{item.icon}</span>
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
    <div className="min-h-screen bg-[#eef1f5] p-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-[1480px] gap-5">
        <aside className="hidden w-[248px] shrink-0 rounded-[26px] bg-[#050607] px-5 py-6 text-white shadow-[0_18px_40px_rgba(0,0,0,0.16)] lg:flex lg:flex-col">
          <div className="flex items-center gap-3 border-b border-white/8 pb-6">
            <BrandMark />
            <div>
              <p className="text-[10px] uppercase tracking-[0.32em] text-white/42">
                Brivia
              </p>
              <p className="text-[17px] font-semibold tracking-[0.02em] text-white">
                Modas
              </p>
            </div>
          </div>

          <nav className="mt-7 space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                active={pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))}
              />
            ))}
          </nav>

          <div className="mt-auto rounded-[18px] border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[13px] font-medium text-white">Brivia Modas ERP</p>
            <p className="mt-1 text-[12px] leading-5 text-white/52">
              Dashboard limpo para operação e gestão.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 rounded-[28px] bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <header className="border-b border-[#edf0f4] px-8 py-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#f5f7fa] text-[#111827]">
                  <SearchIcon />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-[24px] font-semibold tracking-[-0.04em] text-[#111827]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-1 text-[13px] text-[#667085]">{subtitle}</p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex h-12 min-w-[264px] items-center gap-3 rounded-[16px] border border-[#eceff3] bg-[#fafbfc] px-4 text-[#98a2b3]">
                  <SearchIcon />
                  <span className="text-[14px]">Buscar</span>
                </div>

                <div className="flex h-12 items-center gap-2 rounded-[16px] border border-[#eceff3] bg-[#fafbfc] px-4 text-[14px] text-[#4b5563]">
                  <CalendarIcon />
                  <span>Configurações</span>
                </div>

                <button className="flex h-12 w-12 items-center justify-center rounded-[16px] border border-[#eceff3] bg-[#fafbfc] text-[#6b7280]">
                  <BellIcon />
                </button>

                <div className="flex h-12 items-center gap-3 rounded-[16px] border border-[#eceff3] bg-[#fafbfc] px-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ff6a2b] text-[14px] font-semibold text-white">
                    B
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[14px] font-medium text-[#111827]">Brivia Modas</p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-8 py-7">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default AppShell;
