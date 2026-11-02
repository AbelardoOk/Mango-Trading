"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarClock,
  CircleHelp,
  History,
  LayoutDashboard,
  LineChart,
  LogOut,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePortfolio } from "@/contexts/PortfolioContext";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/cn";

const userNav = [
  { href: "/dashboard", label: "Visão geral", short: "Visão", icon: LayoutDashboard },
  { href: "/market", label: "Mercado", short: "Mercado", icon: LineChart },
  { href: "/wallet", label: "Minha carteira", short: "Carteira", icon: Wallet },
  { href: "/history", label: "Histórico", short: "Histórico", icon: History },
  { href: "/ranking", label: "Ranking", short: "Ranking", icon: Trophy },
];

const adminNav = [
  { href: "/admin/stocks", label: "Ações e empresas", short: "Ações", icon: Building2 },
  { href: "/admin/events", label: "Eventos de mercado", short: "Eventos", icon: CalendarClock },
  { href: "/admin/users", label: "Usuários", short: "Usuários", icon: Users },
];

function pageTitle(pathname: string) {
  if (pathname.startsWith("/market/")) return "Negociar ação";
  const all = [...userNav, ...adminNav];
  return all.find((item) => item.href === pathname)?.label ?? "Mango Trading";
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const { portfolio } = usePortfolio();
  const pathname = usePathname();
  const isAdminArea = pathname.startsWith("/admin");
  const nav = isAdminArea ? adminNav : userNav;
  const title = pageTitle(pathname);
  const balance = portfolio ? formatMoney(portfolio.balance) : "M$ —";

  return (
    <div className="flex min-h-screen bg-bg">
      <a
        href="#main"
        className="skip sr-only z-[70] focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:rounded-lg focus:bg-white focus:p-3 focus:shadow"
      >
        Pular para o conteúdo
      </a>

      <aside className="fixed inset-y-0 left-0 hidden w-[248px] flex-col gap-6 overflow-y-auto bg-ink p-5 text-[#dce8df] md:flex">
        <Link href="/dashboard" className="block px-2 pt-1" aria-label="Mango Trading — visão geral">
          <div className="text-3xl font-bold tracking-tight text-orange">mango.</div>
          <div className="mt-1 text-[9px] tracking-[0.22em] text-[#becfc5]">TRADING SIMULATOR</div>
        </Link>

        <nav
          aria-label={isAdminArea ? "Administração" : "Navegação principal"}
          className="flex flex-col gap-1"
        >
          <span className="mb-1 px-3 text-[9px] font-bold tracking-[0.18em] text-[#8fa79a]">
            {isAdminArea ? "ADMINISTRAR" : "JOGAR"}
          </span>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                  active
                    ? "bg-green text-white shadow-sm"
                    : "text-[#dce8df] hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-bold tracking-widest text-[#8fa79a]">SALDO DISPONÍVEL</p>
            <p className="money mt-1 text-lg font-bold text-white">{balance}</p>
            <Link href="/wallet" className="mt-1 inline-block text-[11px] text-orange underline underline-offset-2">
              Ver carteira →
            </Link>
          </div>
          <p className="px-2 text-[11px] leading-relaxed text-[#8fa79a]">
            100% virtual. Empresas e cotações fictícias.
          </p>
          {isAdmin ? (
            <Link
              href={isAdminArea ? "/dashboard" : "/admin/stocks"}
              className="flex items-center gap-2 px-2 text-xs font-semibold text-[#dce8df] underline underline-offset-2"
            >
              <ArrowLeft className={cn("h-3.5 w-3.5", !isAdminArea && "rotate-180")} aria-hidden="true" />
              {isAdminArea ? "Área do jogador" : "Administração"}
            </Link>
          ) : null}
          <div className="flex items-center gap-2 border-t border-white/10 pt-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange text-xs font-bold text-ink">
              {(user?.name || "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">{user?.name || ""}</p>
              <p className="text-[10px] text-[#8fa79a]">{isAdmin ? "Administrador" : "Jogador"}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg p-1.5 text-[#becfc5] hover:bg-white/10 hover:text-white"
              aria-label="Sair da conta"
              title="Sair da conta"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col md:ml-[248px]">
        <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/dashboard" className="text-2xl font-bold tracking-tight text-green md:hidden" aria-label="Mango Trading">
                mango<span className="text-orange">.</span>
              </Link>
              <div className="hidden min-w-0 sm:block">
                <p className="text-[9px] font-bold tracking-[0.18em] text-muted">
                  {isAdminArea ? "ADMINISTRAÇÃO / ACESSO RESTRITO" : "ÁREA DO JOGADOR"}
                </p>
                <h2 className="truncate text-sm font-bold text-ink">{title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-1.5 md:gap-2">
              <Link
                href="/wallet"
                className="money flex min-h-9 items-center rounded-full border border-line bg-bg px-3 text-xs font-bold text-ink hover:border-green"
                aria-label={`Saldo disponível: ${balance}`}
              >
                {balance}
              </Link>
              <Link
                href="/guide"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-soft hover:text-green"
                aria-label="Ajuda e guia"
                title="Ajuda e guia"
              >
                <CircleHelp className="h-[18px] w-[18px]" aria-hidden="true" />
              </Link>
              <details className="group relative">
                <summary className="flex h-9 cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-white px-2 pr-2.5 text-xs font-semibold text-ink marker:content-none hover:border-green [&::-webkit-details-marker]:hidden">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green text-[10px] font-bold text-white">
                    {(user?.name || "?").slice(0, 1).toUpperCase()}
                  </span>
                  <span className="hidden max-w-28 truncate lg:block">{user?.name}</span>
                  {isAdmin ? (
                    <span className="hidden rounded-full bg-[#fff0d6] px-1.5 py-0.5 text-[9px] font-bold text-[#754600] sm:block">
                      ADMIN
                    </span>
                  ) : null}
                </summary>
                <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-line bg-white p-2 shadow-lg">
                  <div className="border-b border-line px-2 py-2">
                    <p className="truncate text-sm font-semibold">{user?.name}</p>
                    <p className="truncate text-xs text-muted">{user?.email}</p>
                  </div>
                  {isAdmin ? (
                    <Link
                      href={isAdminArea ? "/dashboard" : "/admin/stocks"}
                      className="mt-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-ink hover:bg-bg"
                    >
                      <ArrowLeft className={cn("h-4 w-4", !isAdminArea && "rotate-180")} aria-hidden="true" />
                      {isAdminArea ? "Área do jogador" : "Administração"}
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm text-red hover:bg-[#fbece9]"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Sair da conta
                  </button>
                </div>
              </details>
            </div>
          </div>
        </header>

        <main
          id="main"
          className="mx-auto flex w-full max-w-[1500px] flex-1 flex-col gap-6 px-4 py-5 pb-24 md:px-8 md:py-8 md:pb-8"
        >
          {children}
        </main>
      </div>

      <nav
        aria-label={isAdminArea ? "Navegação administrativa" : "Navegação principal"}
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <div className="flex items-stretch justify-around px-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold",
                  active ? "text-green" : "text-muted"
                )}
              >
                <span className={cn("rounded-lg p-1.5", active && "bg-soft")}>
                  <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <span className="max-w-full truncate">{item.short}</span>
              </Link>
            );
          })}
          {isAdminArea ? (
            <Link
              href="/dashboard"
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold text-muted"
            >
              <span className="rounded-lg p-1.5">
                <ArrowLeft className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span>Jogador</span>
            </Link>
          ) : null}
        </div>
      </nav>
    </div>
  );
}
