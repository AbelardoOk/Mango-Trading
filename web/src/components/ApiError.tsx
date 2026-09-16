"use client";
import { ApiError } from "@/types/api";

export function ApiErrorAlert({ error, onClose }: { error: unknown; onClose?: () => void }) {
  if (!error) return null;
  let message = "Erro inesperado";
  let details: string[] | null = null;

  if (error instanceof ApiError) {
    if (error.errors) {
      details = Object.entries(error.errors).map(([k, v]) => `${k}: ${v}`);
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
    <div role="alert" className="alert error" style={{ background: "#fbece9", color: "#9c2e26", padding: "15px 18px", borderRadius: 10, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
        <div>
          <strong>{message}</strong>
          {details && (
            <ul style={{ margin: "8px 0 0 18px", fontSize: 13 }}>
              {details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} aria-label="Fechar erro" style={{ background: "transparent", border: 0, fontSize: 18, cursor: "pointer" }}>
            ×
          </button>
        )}
      </div>
    </div>
  );
}
