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


function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h9.9a1 1 0 0 0 1-.8L21 7H7" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 8.5A3.5 3.5 0 1 0 12 15.5A3.5 3.5 0 1 0 12 8.5z" />
      <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 0 1-4 0v-.2a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 0 1 0-4h.2a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 0 1 4 0v.2a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 0 1 0 4h-.2a1 1 0 0 0-.9.6z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function IconChart() {
  return (
    <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 19V5" />
      <path d="M10 19V10" />
      <path d="M16 19V7" />
      <path d="M22 19V13" />
    </svg>
  );
}

function SidebarItem({ item, active }: { item: NavItem; active: boolean }) {
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
      <span className={active ? "text-[#ff6a2b]" : "text-white/75"}>
        {item.icon}
      </span>
      <span>{item.label}</span>
    </Link>
  );
}

function BottomNavItem({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex flex-1 flex-col items-center justify-center gap-1 py-2 transition active:scale-95"
    >
      <span className={active ? "text-[#ff6a2b]" : "text-[#9ca3af]"}>
        {item.icon}
      </span>
      <span
        className={[
          "text-[10px] font-medium leading-none",
          active ? "text-[#ff6a2b]" : "text-[#9ca3af]",
        ].join(" ")}
      >
        {item.label}
      </span>
    </Link>
  );
}

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/relatorios", label: "Dashboard", icon: <IconChart /> },
    { href: "/compras", label: "Compras", icon: <IconCart /> },
    { href: "/vendas", label: "Vendas", icon: <IconBox /> },
    { href: "/configuracoes-v2", label: "Config.", icon: <IconSettings /> },
  ];

  function isActive(item: NavItem) {
    return pathname?.startsWith(item.href) ?? false;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] lg:p-4">
      <div className="mx-auto flex min-h-screen max-w-[1460px] gap-4 lg:min-h-[calc(100vh-2rem)]">

        {/* ── desktop sidebar ── */}
        <aside className="hidden w-[220px] shrink-0 rounded-[18px] bg-[#050607] px-4 py-5 text-white shadow-[0_12px_32px_rgba(0,0,0,0.14)] lg:flex lg:flex-col">
          <div className="border-b border-white/8 pb-5">
            <img src="/logo.png" alt="Brivia Modas" className="h-[48px] w-auto object-contain" />
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => (
              <SidebarItem key={item.href} item={item} active={isActive(item)} />
            ))}
          </nav>

          <div className="mt-auto rounded-[14px] border border-white/8 bg-white/[0.03] p-3">
            <p className="text-[12px] font-medium text-white">Brivia ERP</p>
            <p className="mt-1 text-[11px] leading-5 text-white/52">Painel operacional.</p>
          </div>
        </aside>

        {/* ── main ── */}
        <main className="min-w-0 flex-1 bg-white pb-[72px] lg:rounded-[18px] lg:pb-0 lg:shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
          <header className="border-b border-[#edf0f4] px-4 py-4 lg:px-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/logo.png" alt="Brivia Modas" className="h-[32px] w-auto object-contain lg:hidden" />
                <div className="min-w-0">
                  <h1 className="truncate text-[18px] font-semibold tracking-[-0.03em] text-[#111827] lg:text-[24px]">
                    {title}
                  </h1>
                  {subtitle ? (
                    <p className="mt-0.5 hidden truncate text-[13px] text-[#667085] lg:block">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="hidden items-center gap-3 lg:flex">
                <div className="flex h-10 w-10 items-center justify-center rounded-[12px] border border-[#eceff3] bg-[#fafbfc]">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#ff6a2b] text-[13px] font-semibold text-white">
                    B
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-4 lg:px-6 lg:py-5">{children}</div>
        </main>
      </div>

      {/* ── mobile bottom nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-[68px] items-stretch border-t border-[#e5e7eb] bg-white/95 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {navItems.map((item) => (
          <BottomNavItem key={item.href} item={item} active={isActive(item)} />
        ))}
      </nav>
    </div>
  );
}

export default AppShell;
