"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/env";
import { getPortfolio } from "@/services/api/portfolio";
import { PortfolioHistoryPoint, PortfolioLiveResponse, PortfolioResponse } from "@/types/api";

type PortfolioContextValue = {
  portfolio: PortfolioResponse | null;
  point: PortfolioHistoryPoint | null;
  connected: boolean;
  refresh: () => Promise<void>;
  setPortfolio: React.Dispatch<React.SetStateAction<PortfolioResponse | null>>;
};

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function pointFromPortfolio(portfolio: PortfolioResponse): PortfolioHistoryPoint {
  return {
    timestamp: new Date().toISOString(),
    patrimony: portfolio.totalPatrimony,
    balance: portfolio.balance,
    stockValue: portfolio.totalCurrentValue,
  };
}

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [point, setPoint] = useState<PortfolioHistoryPoint | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  const refresh = useCallback(async () => {
    const data = await getPortfolio();
    setPortfolio(data);
    setPoint(pointFromPortfolio(data));
  }, []);

  useEffect(() => {
    let stopped = false;
    let fallback: ReturnType<typeof setInterval> | null = null;
    let reconnect: ReturnType<typeof setTimeout> | null = null;

    function startFallback() {
      if (fallback) return;
      fallback = setInterval(() => {
        getPortfolio()
          .then((data) => {
            setPortfolio(data);
            setPoint(pointFromPortfolio(data));
          })
          .catch(() => {});
      }, 5000);
    }

    function connect() {
      if (stopped) return;
      const token = getToken();
      if (!token) {
        startFallback();
        return;
      }
      const es = new EventSource(
        `${API_URL}/api/stream/portfolio?token=${encodeURIComponent(token)}`
      );
      esRef.current = es;

      es.addEventListener("portfolio", (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data) as PortfolioLiveResponse;
          if (data.portfolio) setPortfolio(data.portfolio);
          if (data.point) setPoint(data.point);
        } catch {}
      });
      es.addEventListener("init", () => setConnected(true));
      es.onopen = () => {
        setConnected(true);
        if (fallback) {
          clearInterval(fallback);
          fallback = null;
        }
      };
      es.onerror = () => {
        setConnected(false);
        es.close();
        startFallback();
        if (!stopped) reconnect = setTimeout(connect, 5000);
      };
    }

    getPortfolio()
      .then((data) => {
        setPortfolio(data);
        setPoint(pointFromPortfolio(data));
      })
      .catch(() => {});
    connect();

    return () => {
      stopped = true;
      esRef.current?.close();
      if (fallback) clearInterval(fallback);
      if (reconnect) clearTimeout(reconnect);
    };
  }, []);

  return (
    <PortfolioContext.Provider value={{ portfolio, point, connected, refresh, setPortfolio }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error("usePortfolio deve ser usado dentro de PortfolioProvider");
  }
  return context;
}
