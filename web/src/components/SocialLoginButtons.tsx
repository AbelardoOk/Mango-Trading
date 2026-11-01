"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GOOGLE_CLIENT_ID, TIKTOK_CLIENT_KEY } from "@/lib/env";

type GoogleCredentialResponse = { credential?: string };
type GoogleIdApi = {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

// Chave do sessionStorage com o state anti-CSRF do TikTok (conferido na página de callback)
export const TIKTOK_STATE_KEY = "tiktok_oauth_state";
export const TIKTOK_CALLBACK_PATH = "/auth/tiktok/callback";

export function SocialLoginButtons({ onError }: { onError: (error: unknown) => void }) {
  const { loginWithGoogle } = useAuth();
  const router = useRouter();
  const googleRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef({ loginWithGoogle, router, onError });

  // Mantém o callback do Google (registrado uma única vez) sempre com as funções atuais
  useEffect(() => {
    handlersRef.current = { loginWithGoogle, router, onError };
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const container = googleRef.current;
    if (!container) return;

    function init() {
      const api = window.google?.accounts.id;
      if (!api || !container) return;
      api.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) return;
          try {
            await handlersRef.current.loginWithGoogle(response.credential);
            handlersRef.current.router.push("/dashboard");
          } catch (err) {
            handlersRef.current.onError(err);
          }
        },
      });
      container.replaceChildren();
      api.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "continue_with",
        shape: "rectangular",
        width: Math.min(400, container.clientWidth || 320),
        locale: "pt-BR",
      });
    }

    if (window.google?.accounts.id) {
      init();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = GOOGLE_SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
    script.addEventListener("load", init);
    return () => script.removeEventListener("load", init);
  }, []);

  function startTiktok() {
    const state = crypto.randomUUID();
    try {
      sessionStorage.setItem(TIKTOK_STATE_KEY, state);
    } catch {
      // sem sessionStorage a conferência do state falha no callback e o login é recusado
    }
    const params = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      scope: "user.info.basic",
      response_type: "code",
      redirect_uri: `${window.location.origin}${TIKTOK_CALLBACK_PATH}`,
      state,
    });
    window.location.assign(`https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`);
  }

  // Sem credenciais configuradas, nenhum botão aparece
  if (!GOOGLE_CLIENT_ID && !TIKTOK_CLIENT_KEY) return null;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-center text-[#4a5a52]">ou continue com</p>
      {GOOGLE_CLIENT_ID && <div ref={googleRef} className="flex justify-center" />}
      {TIKTOK_CLIENT_KEY && (
        <button
          type="button"
          onClick={startTiktok}
          className="border border-[#6d7f75] rounded-lg py-3 font-semibold text-[#172e27]"
        >
          Continuar com TikTok
        </button>
      )}
    </div>
  );
}
