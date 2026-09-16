"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout, isAdmin } = useAuth();
  const pathname = usePathname();

  const userNav = [
    { href: "/dashboard", label: "Visão geral" },
    { href: "/market", label: "Mercado" },
    { href: "/wallet", label: "Minha carteira" },
    { href: "/history", label: "Histórico" },
    { href: "/ranking", label: "Ranking" },
  ];
  const adminNav = [
    { href: "/admin/stocks", label: "Ações e empresas" },
    { href: "/admin/events", label: "Eventos de mercado" },
    { href: "/admin/users", label: "Usuários" },
  ];
  const nav = isAdmin && pathname.startsWith("/admin") ? adminNav : userNav;

  return (
    <div className="min-h-screen bg-[#f5f7f3] flex">
      <a href="#main" className="skip sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 bg-white p-2 z-50">
        Pular para o conteúdo
      </a>
      <aside className="hidden md:flex w-[232px] fixed inset-y-0 left-0 bg-[#172e27] text-[#dce8df] p-6 flex-col gap-6">
        <div>
          <div className="text-[#f5ac45] text-3xl font-bold">mango.</div>
          <div className="text-[9px] tracking-widest text-[#becfc5] mt-2">TRADING SIMULATOR</div>
        </div>
        <nav aria-label={isAdmin && pathname.startsWith("/admin") ? "Administração" : "Navegação principal"} className="flex flex-col gap-2">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={pathname === n.href ? "page" : undefined} className={`px-4 py-3 rounded-lg text-sm font-semibold ${pathname === n.href ? "bg-[#174f3d] text-white" : "text-[#dce8df] hover:bg-[#1e3d33]"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <p className="text-xs text-[#becfc5]">100% VIRTUAL<br />Empresas fictícias.</p>
          {isAdmin && pathname.startsWith("/admin") ? (
            <Link href="/dashboard" className="text-xs underline">← Área do jogador</Link>
          ) : isAdmin ? (
            <Link href="/admin/stocks" className="text-xs underline">→ Administração</Link>
          ) : null}
          <div className="text-xs">{user?.name || ""}</div>
          <button onClick={logout} className="text-left text-xs underline">Sair da conta</button>
        </div>
      </aside>
      <div className="flex-1 md:ml-[232px] flex flex-col min-h-screen">
        <header className="flex justify-between items-center px-6 py-4 bg-white border-b">
          <span className="text-xs tracking-widest font-bold text-[#4a5a52]">{isAdmin && pathname.startsWith("/admin") ? "ADMINISTRAÇÃO / ACESSO RESTRITO" : "ÁREA DO JOGADOR"}</span>
          <span className="text-sm">{user?.name || ""} {isAdmin && <span className="ml-2 bg-[#fff0d6] text-[#754600] px-2 py-1 rounded text-xs">Administrador</span>}</span>
        </header>
        <main id="main" className="flex-1 p-6 md:p-8 max-w-[1700px] w-full mx-auto flex flex-col gap-6">
          {children}
        </main>
      </div>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-50">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={`text-xs py-2 px-3 rounded ${pathname === n.href ? "bg-[#e8f1eb] text-[#174f3d]" : "text-[#4a5a52]"}`}>
            {n.label.replace("Minha ", "")}
          </Link>
        ))}
      </nav>
    </div>
  );
}
