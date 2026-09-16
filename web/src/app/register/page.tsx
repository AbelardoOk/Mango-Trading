"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiErrorAlert } from "@/components/ApiError";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2" id="main">
      <section className="bg-[#172e27] text-white p-8 md:p-12 flex flex-col gap-6">
        <div className="logo text-[#f5ac45] text-3xl font-bold">mango.</div>
        <span className="eyebrow text-[#c7d7cc] text-xs tracking-widest">COMECE SUA JORNADA</span>
        <h1 className="text-4xl leading-tight">Crie sua conta.<br /><span className="text-[#f5ac45]">Explore.</span></h1>
        <p className="text-[#c7d7cc]">Saldo inicial M$ 10.000 para começar.</p>
      </section>
      <section className="flex items-center justify-center p-6 md:p-12 bg-[#f5f7f3]">
        <form onSubmit={handle} className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-4 shadow">
          <span className="eyebrow text-[#174f3d] text-xs tracking-widest">CADASTRO</span>
          <h2 className="text-2xl font-semibold">Criar conta</h2>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <label className="field">
            Nome
            <input required value={name} onChange={(e) => setName(e.target.value)} className="border border-[#6d7f75] rounded-lg p-3 w-full" placeholder="Ana Silva" />
          </label>
          <label className="field">
            E-mail
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="border border-[#6d7f75] rounded-lg p-3 w-full" placeholder="ana@email.com" />
          </label>
          <label className="field">
            Senha
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="border border-[#6d7f75] rounded-lg p-3 w-full" placeholder="mín. 6 caracteres" />
          </label>
          <button type="submit" disabled={loading} className="bg-[#174f3d] text-white rounded-lg py-3 font-semibold disabled:opacity-50">
            {loading ? "Criando..." : "Criar conta →"}
          </button>
          <p className="text-sm text-center">
            Já tem conta? <Link href="/login" className="text-[#174f3d] font-semibold">Entrar</Link>
          </p>
        </form>
      </section>
    </main>
  );
}
