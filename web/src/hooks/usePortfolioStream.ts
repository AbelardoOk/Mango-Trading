"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/env";
import { getPortfolio } from "@/services/api/portfolio";
import { PortfolioHistoryPoint, PortfolioLiveResponse, PortfolioResponse } from "@/types/api";

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

export function usePortfolioStream() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [point, setPoint] = useState<PortfolioHistoryPoint | null>(null);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

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
        if (!stopped) {
          reconnect = setTimeout(connect, 5000);
        }
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

  return { portfolio, point, connected, setPortfolio };
}
