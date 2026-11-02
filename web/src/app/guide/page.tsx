import Link from "next/link";
import { ArrowLeft, ArrowRight, BarChart3, BookOpen, Keyboard, ShieldCheck, Sparkles, Trophy, Wallet } from "lucide-react";

const rules = [
  { title: "Saldo inicial", text: "Todo jogador começa com M$ 10.000 virtuais ao criar a conta." },
  { title: "Compra e venda", text: "O preço usado é o preço atual da ação no momento da confirmação da ordem." },
  { title: "Patrimônio", text: "Patrimônio = saldo disponível + valor atual de todas as ações na carteira." },
  { title: "Resultado", text: "Resultado = (preço atual − preço médio) × quantidade. O preço médio é ponderado." },
  { title: "Eventos", text: "Eventos fictícios podem alterar preços de uma empresa, setor ou de todo o mercado." },
  { title: "Ranking", text: "A classificação usa o patrimônio total. Não há dinheiro real envolvido." },
];

const glossary = [
  { term: "M$", definition: "Moeda virtual usada em toda a simulação." },
  { term: "Preço médio", definition: "Custo médio por ação considerando todas as compras daquele ativo." },
  { term: "Volatilidade", definition: "Parâmetro que indica o quanto o preço pode oscilar na simulação." },
  { term: "Evento de mercado", definition: "Acontecimento fictício com impacto programado sobre os preços." },
  { term: "Patrimônio", definition: "Soma do saldo em conta com o valor de mercado das posições." },
];

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-bg" id="main">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-6 md:px-8 md:py-10">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="text-3xl font-bold tracking-tight text-green">
            mango<span className="text-orange">.</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-border bg-white px-4 text-sm font-semibold text-ink hover:bg-soft">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar ao login
            </Link>
            <Link href="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#123f30]">
              Criar conta <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </header>

        <section className="rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8">
          <span className="text-[10px] font-bold tracking-[0.2em] text-green">GUIA DO JOGADOR</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink md:text-4xl">Como funciona o Mango Trading</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            O Mango Trading é um simulador educacional. Todas as empresas, cotações, eventos e valores são fictícios.
            Você pode comprar, vender, acompanhar o patrimônio e disputar o ranking sem usar dinheiro real.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-soft p-4">
              <Wallet className="h-5 w-5 text-green" aria-hidden="true" />
              <h2 className="mt-2 text-sm font-bold text-ink">Saldo virtual</h2>
              <p className="mt-1 text-xs text-muted">M$ 10.000 para começar.</p>
            </div>
            <div className="rounded-xl bg-[#fff0d6] p-4">
              <BarChart3 className="h-5 w-5 text-[#754600]" aria-hidden="true" />
              <h2 className="mt-2 text-sm font-bold text-ink">Mercado ao vivo</h2>
              <p className="mt-1 text-xs text-muted">Preços e eventos atualizados.</p>
            </div>
            <div className="rounded-xl bg-soft p-4">
              <Trophy className="h-5 w-5 text-green" aria-hidden="true" />
              <h2 className="mt-2 text-sm font-bold text-ink">Ranking</h2>
              <p className="mt-1 text-xs text-muted">Dispute por patrimônio.</p>
            </div>
          </div>
        </section>

        <section aria-labelledby="rules-title" className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green" aria-hidden="true" />
            <h2 id="rules-title" className="text-lg font-bold text-ink">Regras rápidas</h2>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {rules.map((rule) => (
              <div key={rule.title} className="rounded-xl border border-line p-3">
                <dt className="text-sm font-semibold text-ink">{rule.title}</dt>
                <dd className="mt-1 text-xs leading-relaxed text-muted">{rule.text}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="glossary-title" className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-green" aria-hidden="true" />
            <h2 id="glossary-title" className="text-lg font-bold text-ink">Glossário</h2>
          </div>
          <dl className="mt-4 divide-y divide-line">
            {glossary.map((item) => (
              <div key={item.term} className="grid gap-1 py-3 sm:grid-cols-[140px_1fr]">
                <dt className="text-sm font-semibold text-ink">{item.term}</dt>
                <dd className="text-sm text-muted">{item.definition}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="access-title" className="rounded-2xl border border-line bg-white p-6">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-green" aria-hidden="true" />
            <h2 id="access-title" className="text-lg font-bold text-ink">Acessibilidade e atalhos</h2>
          </div>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <li>Use <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 text-xs text-ink">Tab</kbd> para navegar e <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 text-xs text-ink">Enter</kbd> para ativar.</li>
            <li>O link “Pular para o conteúdo” aparece no primeiro Tab.</li>
            <li>Gráficos possuem descrição textual e tabela de dados alternativa.</li>
            <li>As cores não são o único indicador: setas e sinais acompanham altas e quedas.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-green/30 bg-soft p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-green" aria-hidden="true" />
            <div>
              <h2 className="text-lg font-bold text-ink">Pronto para começar?</h2>
              <p className="mt-1 text-sm text-muted">
                Crie sua conta gratuitamente ou entre com as credenciais demo configuradas no ambiente
                (<code className="rounded bg-white px-1.5 py-0.5 text-xs">admin@mango.local</code> / <code className="rounded bg-white px-1.5 py-0.5 text-xs">admin123</code>).
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/register" className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-green px-4 text-sm font-semibold text-white hover:bg-[#123f30]">
                  Criar conta <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/login" className="inline-flex min-h-10 items-center rounded-xl border border-border bg-white px-4 text-sm font-semibold text-ink hover:bg-bg">
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="pb-6 text-xs text-muted">100% VIRTUAL · Empresas e cotações fictícias.</footer>
      </div>
    </main>
  );
}
