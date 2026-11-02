import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, ShieldCheck, Sparkles, Trophy, Wallet } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "Comece com M$ 10.000",
    description: "Crie sua conta e receba saldo virtual para testar suas primeiras decisões.",
  },
  {
    icon: BarChart3,
    title: "Explore o mercado",
    description: "Compare empresas fictícias, acompanhe preços em tempo real e monte sua carteira.",
  },
  {
    icon: Trophy,
    title: "Evolua no ranking",
    description: "Acompanhe seu patrimônio e dispute posição com outros jogadores.",
  },
];

const features = [
  { icon: Sparkles, title: "Cotações em tempo real", description: "Preços e eventos de mercado atualizados durante a simulação." },
  { icon: ShieldCheck, title: "Zero risco real", description: "Nenhum dinheiro de verdade. Tudo é virtual e educacional." },
  { icon: BookOpen, title: "Aprenda fazendo", description: "Gráficos, histórico e relatórios para entender cada movimento." },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-ink text-white" id="main">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 md:px-8">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="text-3xl font-bold tracking-tight text-orange">
            mango<span className="text-white">.</span>
          </Link>
          <nav className="flex items-center gap-2" aria-label="Navegação da capa">
            <Link href="/guide" className="hidden rounded-xl px-3 py-2 text-sm font-semibold text-[#dce8df] hover:bg-white/10 sm:block">
              Como funciona
            </Link>
            <Link href="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-white hover:bg-white/10">
              Entrar
            </Link>
            <Link href="/register" className="inline-flex min-h-10 items-center gap-1 rounded-xl bg-orange px-4 text-sm font-bold text-ink hover:bg-[#f2a233]">
              Criar conta <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </nav>
        </header>

        <section className="relative flex flex-1 flex-col justify-center gap-6 py-14 md:py-20">
          <div className="pointer-events-none absolute -right-24 top-4 h-80 w-80 rounded-full bg-green/50 blur-3xl" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-orange/15 blur-3xl" aria-hidden="true" />
          <div className="relative max-w-3xl">
            <span className="text-[10px] font-bold tracking-[0.22em] text-orange">APRENDA. NEGOCIE. EVOLUA.</span>
            <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
              O mercado é fictício.
              <br />
              <span className="text-orange">A experiência é sua.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#c7d7cc]">
              Simule investimentos com ações fictícias, dinheiro virtual M$ e ranking por patrimônio. Sem risco, com aprendizado de verdade.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-orange px-6 text-sm font-bold text-ink hover:bg-[#f2a233]">
                Começar agora <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/login" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-ink hover:bg-[#eef3ef]">
                Já tenho conta
              </Link>
              <Link href="/guide" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/30 px-6 text-sm font-semibold text-white hover:bg-white/10">
                Conhecer o guia
              </Link>
            </div>
            <p className="mt-3 text-xs text-[#9fb5a8]">Saldo inicial de M$ 10.000 · 100% virtual · sem cartão de crédito</p>
          </div>
        </section>

        <section aria-labelledby="steps-title" className="pb-12">
          <h2 id="steps-title" className="text-[10px] font-bold tracking-[0.2em] text-orange">COMO FUNCIONA</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-white/10 p-2 text-orange">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold text-[#9fb5a8]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-3 font-bold text-white">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#c7d7cc]">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section aria-labelledby="features-title" className="border-t border-white/10 py-10">
          <h2 id="features-title" className="text-[10px] font-bold tracking-[0.2em] text-orange">POR QUE JOGAR</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-3">
                  <span className="mt-0.5 rounded-lg bg-white/10 p-2 text-orange">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-[#9fb5a8]">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-white/10 py-6 text-xs text-[#9fb5a8] sm:flex-row sm:items-center sm:justify-between">
          <span>Abelardo · Miguel · Giovana — UFMS FACOM</span>
          <span>100% VIRTUAL · Empresas fictícias</span>
        </footer>
      </div>
    </main>
  );
}
