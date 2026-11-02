"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Rocket, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { dismissOnboarding, readOnboarding, type OnboardingState } from "@/lib/onboarding";
import { cn } from "@/lib/cn";

type Step = {
  key: keyof Omit<OnboardingState, "dismissed"> | "firstBuy";
  label: string;
  description: string;
  href: string;
};

const steps: Step[] = [
  { key: "market", label: "Explorar o mercado", description: "Conheça as empresas fictícias.", href: "/market" },
  { key: "firstBuy", label: "Fazer a primeira compra", description: "Invista seu saldo virtual.", href: "/market" },
  { key: "wallet", label: "Revisar a carteira", description: "Acompanhe posições e patrimônio.", href: "/wallet" },
  { key: "ranking", label: "Conferir o ranking", description: "Veja sua posição entre os jogadores.", href: "/ranking" },
];

export function OnboardingChecklist({ hasPosition }: { hasPosition: boolean }) {
  const [state, setState] = useState<OnboardingState>({});

  useEffect(() => {
    const sync = () => setState(readOnboarding());
    sync();
    window.addEventListener("mango:onboarding", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("mango:onboarding", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (state.dismissed) return null;

  const done = steps.filter((step) =>
    step.key === "firstBuy" ? hasPosition : Boolean(state[step.key])
  ).length;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-soft p-2 text-green">
            <Rocket className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-sm font-bold text-ink">Primeiros passos</h3>
            <p className="text-xs text-muted">
              {done} de {steps.length} concluídos
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            dismissOnboarding();
            setState((current) => ({ ...current, dismissed: true }));
          }}
          className="rounded-lg p-1 text-muted hover:bg-bg"
          aria-label="Dispensar checklist"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-soft" aria-hidden="true">
        <div
          className="h-full rounded-full bg-green transition-all"
          style={{ width: `${(done / steps.length) * 100}%` }}
        />
      </div>

      <ul className="mt-3 flex flex-col gap-1">
        {steps.map((step) => {
          const complete = step.key === "firstBuy" ? hasPosition : Boolean(state[step.key]);
          return (
            <li key={step.key}>
              <Link
                href={step.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-bg",
                  complete ? "text-muted" : "text-ink"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                    complete ? "border-green bg-green text-white" : "border-line text-transparent"
                  )}
                  aria-hidden="true"
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block font-semibold", complete && "line-through")}>{step.label}</span>
                  <span className="block text-[11px] text-muted">{step.description}</span>
                </span>
                {!complete ? <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
