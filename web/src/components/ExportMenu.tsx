"use client";
import { useEffect, useRef, useState } from "react";
import { downloadReport } from "@/services/api/reports";
import { ReportFormat, ReportKind } from "@/types/api";

type Props = {
  kind: ReportKind;
  params?: { from?: string; to?: string; type?: "BUY" | "SELL" | "" };
  label?: string;
};

export function ExportMenu({ kind, params, label = "Exportar" }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<ReportFormat | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handle(format: ReportFormat) {
    setLoading(format);
    setOpen(false);
    setMessage(null);
    try {
      await downloadReport(kind, format, params);
      setMessage(`Relatório ${format.toUpperCase()} gerado.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível gerar o relatório.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="relative flex flex-col items-end gap-1" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={loading !== null}
        className="bg-white border border-[#6d7f75] text-[#174f3d] px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-60"
      >
        {loading ? `Gerando ${loading.toUpperCase()}...` : `${label} ↓`}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Formato do relatório"
          className="absolute right-0 top-full mt-2 z-20 w-44 bg-white border rounded-lg shadow-lg overflow-hidden"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => handle("csv")}
            className="w-full text-left px-4 py-3 text-sm hover:bg-[#e8f1eb]"
          >
            CSV (planilha)
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => handle("pdf")}
            className="w-full text-left px-4 py-3 text-sm hover:bg-[#e8f1eb] border-t"
          >
            PDF (impressão)
          </button>
        </div>
      )}
      {message && (
        <span role="status" className="text-xs text-[#4a5a52] max-w-56 text-right">
          {message}
        </span>
      )}
    </div>
  );
}
