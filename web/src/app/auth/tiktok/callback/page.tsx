"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ApiErrorAlert } from "@/components/ApiError";
import { TIKTOK_CALLBACK_PATH, TIKTOK_STATE_KEY } from "@/components/SocialLoginButtons";

export default function TiktokCallbackPage() {
  const { loginWithTiktok } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<unknown>(null);
  const started = useRef(false);

  useEffect(() => {
    // O código do TikTok só pode ser usado uma vez (evita a execução dupla do modo estrito)
    if (started.current) return;
    started.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    let expectedState: string | null = null;
    try {
      expectedState = sessionStorage.getItem(TIKTOK_STATE_KEY);
      sessionStorage.removeItem(TIKTOK_STATE_KEY);
    } catch {
      expectedState = null;
    }

    if (params.get("error")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError("Login com TikTok cancelado.");
      return;
    }
    if (!code || !state || state !== expectedState) {
      setError("Resposta inválida do TikTok. Tente novamente.");
      return;
    }

    loginWithTiktok(code, `${window.location.origin}${TIKTOK_CALLBACK_PATH}`)
      .then(() => router.replace("/dashboard"))
      .catch(setError);
  }, [loginWithTiktok, router]);

  return (
    <main className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-[#f5f7f3]" id="main">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 flex flex-col gap-4 shadow">
        <span className="eyebrow text-[#174f3d] text-xs tracking-widest">LOGIN COM TIKTOK</span>
        {error ? (
          <>
            <ApiErrorAlert error={error} />
            <Link href="/login" className="bg-[#174f3d] text-white rounded-lg py-3 font-semibold text-center">
              Voltar ao login
            </Link>
          </>
        ) : (
          <h2 className="text-2xl font-semibold">Entrando com o TikTok...</h2>
        )}
      </div>
    </main>
  );
}
