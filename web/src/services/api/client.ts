import { API_URL } from "@/lib/env";
import { ApiError, ErrorEnvelope } from "@/types/api";

type FetchOptions = RequestInit & { auth?: boolean };

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = opts;
  const url = `${API_URL}${path}`;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Don't send auth for public routes
  const isPublic = path.startsWith("/api/auth/");
  if (auth && !isPublic) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...rest, headers: finalHeaders, cache: "no-store" });

  // 204 No Content
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    // Handle error envelope
    if (data && typeof data === "object") {
      const env = data as ErrorEnvelope;
      // Handle plain string "Acesso não autorizado"
      if (typeof data === "string" && res.status === 401) {
        throw new ApiError({ status: 401, message: "Acesso não autorizado" });
      }
      if (env.status || env.message || env.errors) {
        if (res.status === 401) {
          // Clear token on 401
          if (typeof window !== "undefined") {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
        throw new ApiError(env as ErrorEnvelope);
      }
    }
    // Fallback: text error
    if (typeof data === "string" && res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      throw new ApiError({ status: 401, message: data || "Acesso não autorizado" });
    }
    throw new ApiError({ status: res.status, message: typeof data === "string" ? data : `Erro ${res.status}` });
  }

  return data as T;
}

// Convenience for handling 401 redirect in components
export function handleUnauthorizedRedirect() {
  if (typeof window !== "undefined") {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = "/login";
  }
}
