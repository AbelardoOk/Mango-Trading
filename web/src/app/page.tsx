import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#172e27] text-white flex flex-col p-8 md:p-16" id="main">
      <div className="flex justify-between items-start">
        <div className="text-[#f5ac45] text-3xl font-bold">mango.</div>
        <span className="text-[#f5ac45] text-xs tracking-widest">PROTÓTIPO DE INTERFACE · 2026</span>
      </div>
      <div className="flex-1 flex flex-col justify-center gap-6 max-w-3xl">
        <span className="text-[#f5ac45] text-xs tracking-widest">APRENDA. NEGOCIE. EVOLUA.</span>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">O mercado é fictício.<br />A experiência é sua.</h1>
        <p className="text-[#c7d7cc]">Simulação com ações fictícias, dinheiro virtual M$ e ranking por patrimônio.</p>
        <div className="flex gap-4 flex-wrap">
          <Link href="/login" className="bg-[#f5ac45] text-[#172e27] px-6 py-3 rounded-lg font-semibold">Explorar como jogador →</Link>
          <Link href="/register" className="bg-white text-[#172e27] px-6 py-3 rounded-lg">Criar conta</Link>
          <Link href="/market" className="border border-white text-white px-6 py-3 rounded-lg">Ver mercado</Link>
        </div>
      </div>
      <div className="flex justify-between text-xs text-[#c7d7cc] mt-8">
        <span>Abelardo · Miguel · Giovana — UFMS FACOM</span>
        <span>100% VIRTUAL</span>
      </div>
    </main>
  );
}
