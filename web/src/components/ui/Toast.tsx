"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Tone = "success" | "error" | "info";
type ToastInput = { title: string; description?: string; tone?: Tone };
type ToastItem = ToastInput & { id: string };

const ToastContext = createContext<{ toast: (input: ToastInput) => void }>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const toneStyles: Record<Tone, string> = {
  success: "border-green/25 bg-white text-ink",
  error: "border-red/25 bg-white text-ink",
  info: "border-line bg-white text-ink",
};

const toneIcon: Record<Tone, React.ReactNode> = {
  success: <CheckCircle2 className="h-5 w-5 text-green" aria-hidden="true" />,
  error: <AlertCircle className="h-5 w-5 text-red" aria-hidden="true" />,
  info: <Info className="h-5 w-5 text-green" aria-hidden="true" />,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random());
      setItems((current) => [...current.slice(-2), { ...input, id }]);
    },
    []
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-6 md:items-end">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => remove(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const tone = item.tone ?? "info";

  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg shadow-ink/10",
        toneStyles[tone]
      )}
    >
      {toneIcon[tone]}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{item.title}</p>
        {item.description ? <p className="mt-0.5 text-xs text-muted">{item.description}</p> : null}
      </div>
      <button type="button" onClick={onClose} aria-label="Fechar notificação" className="rounded p-1 text-muted hover:bg-bg">
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
