"use client";

import { AlertCircle, X } from "lucide-react";
import { ApiError } from "@/types/api";

export function ApiErrorAlert({ error, onClose }: { error: unknown; onClose?: () => void }) {
  if (!error) return null;
  let message = "Erro inesperado";
  let details: string[] | null = null;

  if (error instanceof ApiError) {
    if (error.errors) {
      details = Object.entries(error.errors).map(([key, value]) => `${key}: ${value}`);
      message = "Corrija os campos destacados";
    } else {
      message = error.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (typeof error === "string") {
    message = error;
  }

  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-red/25 bg-[#fbece9] p-4 text-[#9c2e26]">
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <strong className="text-sm">{message}</strong>
        {details ? (
          <ul className="mt-2 list-inside list-disc text-xs">
            {details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {onClose ? (
        <button type="button" onClick={onClose} aria-label="Fechar erro" className="rounded-lg p-1 hover:bg-red/10">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
