"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/env";
import { StockResponse } from "@/types/api";
import { listStocks } from "@/services/api/stocks";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function useStockStream(initial: StockResponse[] = []) {
  const [stocks, setStocks] = useState<StockResponse[]>(initial);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let fallback: ReturnType<typeof setInterval> | null = null;

    function connect() {
      const token = getToken();
      if (!token) {
        // fallback polling if no token (should not happen for market, but keep)
        fallback = setInterval(() => listStocks().then(setStocks).catch(() => {}), 5000);
        return;
      }
      const url = `${API_URL}/api/stream/stocks?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("stocks", (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data);
          if (Array.isArray(data)) setStocks(data);
        } catch {}
      });
      es.addEventListener("init", () => setConnected(true));
      es.onerror = () => {
        setConnected(false);
        es.close();
        // fallback polling on error
        fallback = setInterval(() => listStocks().then(setStocks).catch(() => {}), 5000);
        // try reconnect in 5s
        setTimeout(connect, 5000);
      };
      es.onopen = () => setConnected(true);
    }

    // initial fetch for immediate data (SSE will also send init)
    listStocks().then(setStocks).catch(() => {});
    connect();

    return () => {
      esRef.current?.close();
      if (fallback) clearInterval(fallback);
    };
  }, []);

  return { stocks, setStocks, connected };
}
