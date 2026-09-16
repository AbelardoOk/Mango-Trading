"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiErrorAlert } from "@/components/ApiError";
import { ApiError } from "@/types/api";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("ana@email.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      // ApiError already handled for 401
      if (err instanceof ApiError && err.status === 401) {
        setError(new ApiError({ status: 401, message: "Credenciais inválidas" }));
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 md:grid-cols-2" id="main">
      <section className="bg-[#172e27] text-white p-8 md:p-12 flex flex-col gap-6">
        <div className="logo text-[#f5ac45] text-3xl font-bold">mango.</div>
        <span className="eyebrow text-[#c7d7cc] text-xs tracking-widest">SEU PRIMEIRO PASSO NO MERCADO</span>
        <h1 className="text-4xl leading-tight">Aprenda.<br />Negocie.<br /><span className="text-[#f5ac45]">Evolua.</span></h1>
        <p className="text-[#c7d7cc]">Um mercado fictício para testar suas decisões.</p>
      </section>
      <section className="flex items-center justify-center p-6 md:p-12 bg-[#f5f7f3]">
        <form onSubmit={handle} className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-4 shadow">
          <span className="eyebrow text-[#174f3d] text-xs tracking-widest">BEM-VINDO DE VOLTA</span>
          <h2 className="text-2xl font-semibold">O mercado espera por você.</h2>
          <ApiErrorAlert error={error} onClose={() => setError(null)} />
          <label className="field">
            E-mail
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="border border-[#9bada1] rounded-lg p-3 w-full" />
          </label>
          <label className="field">
            Senha
            <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="border border-[#9bada1] rounded-lg p-3 w-full" />
          </label>
          <button type="submit" disabled={loading} className="btn bg-[#174f3d] text-white rounded-lg py-3 font-semibold disabled:opacity-50">
            {loading ? "Entrando..." : "Entrar →"}
          </button>
          <p className="text-sm text-center">
            Ainda não tem conta? <Link href="/register" className="text-[#174f3d] font-semibold">Criar conta</Link>
          </p>
          <hr />
          <Link href="/guide" className="text-center text-sm text-[#596b63]">Guia do protótipo →</Link>
        </form>
      </section>
    </main>
  );
}
