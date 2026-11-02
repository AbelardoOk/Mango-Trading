"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";
import { ApiErrorAlert } from "@/components/ApiError";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/types/api";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errors: Record<string, string> = {};
    if (!email.trim()) errors.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";
    if (!password) errors.password = "Informe sua senha.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function nextPath() {
    const next = new URLSearchParams(window.location.search).get("next");
    return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  }

  async function handle(event: React.FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(nextPath());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(new ApiError({ status: 401, message: "Credenciais inválidas. Confira e-mail e senha." }));
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail("admin@mango.local");
    setPassword("admin123");
    setFieldErrors({});
    setError(null);
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2" id="main">
      <section className="relative flex flex-col gap-6 overflow-hidden bg-ink p-8 text-white md:p-12">
        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-green/50 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-orange/20 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <Link href="/" className="text-3xl font-bold text-orange" aria-label="Voltar para a capa">
            mango.
          </Link>
          <p className="mt-2 text-[10px] font-bold tracking-[0.2em] text-[#9fb5a8]">TRADING SIMULATOR</p>
        </div>
        <div className="relative my-auto flex max-w-lg flex-col gap-4">
          <span className="text-[10px] font-bold tracking-[0.2em] text-orange">SEU PRIMEIRO PASSO NO MERCADO</span>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Aprenda.
            <br />
            Negocie.
            <br />
            <span className="text-orange">Evolua.</span>
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-[#c7d7cc]">
            Um mercado 100% fictício para testar suas decisões, montar uma carteira e disputar o ranking por patrimônio.
          </p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-[#dce8df]">
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange" aria-hidden="true" /> Saldo inicial de M$ 10.000</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange" aria-hidden="true" /> Empresas e cotações fictícias</li>
            <li className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-orange" aria-hidden="true" /> Sem risco financeiro real</li>
          </ul>
        </div>
        <p className="relative text-xs text-[#9fb5a8]">100% VIRTUAL · UFMS FACOM</p>
      </section>

      <section className="flex items-center justify-center bg-bg p-5 md:p-12">
        <form onSubmit={handle} className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-line bg-white p-6 shadow-sm md:p-8" noValidate>
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-green">BEM-VINDO DE VOLTA</span>
            <h2 className="mt-1 text-2xl font-bold text-ink">O mercado espera por você.</h2>
            <p className="mt-1 text-sm text-muted">Entre para continuar sua jornada.</p>
          </div>

          <ApiErrorAlert error={error} onClose={() => setError(null)} />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-ink">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-ink ${fieldErrors.email ? "border-red" : "border-border"}`}
              placeholder="voce@email.com"
            />
            {fieldErrors.email ? <span id="email-error" className="text-xs text-red" role="alert">{fieldErrors.email}</span> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-semibold text-ink">Senha</label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                className={`w-full rounded-xl border px-3.5 py-2.5 pr-11 text-sm text-ink ${fieldErrors.password ? "border-red" : "border-border"}`}
                placeholder="Sua senha"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-bg"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.password ? <span id="password-error" className="text-xs text-red" role="alert">{fieldErrors.password}</span> : null}
          </div>

          <Button type="submit" size="lg" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            {loading ? "Entrando..." : "Entrar"}
            {!loading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
          </Button>

          <button
            type="button"
            onClick={fillDemo}
            className="text-center text-xs font-semibold text-green underline underline-offset-2 hover:text-ink"
          >
            Preencher credenciais demo
          </button>

          <SocialLoginButtons onError={setError} />

          <p className="text-center text-sm text-muted">
            Ainda não tem conta?{" "}
            <Link href="/register" className="font-semibold text-green underline underline-offset-2">
              Criar conta
            </Link>
          </p>
          <div className="border-t border-line pt-3 text-center">
            <Link href="/guide" className="text-sm text-muted underline underline-offset-2 hover:text-green">
              Como funciona o Mango Trading →
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
