"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function AuthGuard({ children, requireAdmin = false }: { children: React.ReactNode; requireAdmin?: boolean }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (requireAdmin && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isAdmin, loading, router, pathname, requireAdmin]);

  if (loading) return <div className="p-8 text-center text-sm text-[#4a5a52]">Carregando...</div>;
  if (!isAuthenticated) return null;
  if (requireAdmin && !isAdmin) return null;
  return <>{children}</>;
}
