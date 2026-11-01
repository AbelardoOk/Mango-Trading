"use client";
import { useEffect, useRef, useState } from "react";
import { getPortfolioHistory } from "@/services/api/portfolio";
import { PortfolioHistoryPoint } from "@/types/api";

export function usePortfolioHistory(range: string, livePoint?: PortfolioHistoryPoint | null) {
  const [points, setPoints] = useState<PortfolioHistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const lastAppend = useRef(0);

  useEffect(() => {
    let active = true;
    getPortfolioHistory(range)
      .then((data) => {
        if (active) setPoints(data);
      })
      .catch(() => {
        if (active) setPoints([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [range]);

  useEffect(() => {
    if (!livePoint) return;
    const now = Date.now();
    if (now - lastAppend.current < 4000) return;
    lastAppend.current = now;

    setPoints((current) => {
      const next = [...current];
      if (next.length === 0) return [livePoint];
      const last = next[next.length - 1];
      if (now - new Date(last.timestamp).getTime() < 60000) {
        next[next.length - 1] = livePoint;
      } else {
        next.push(livePoint);
      }
      return next;
    });
  }, [livePoint]);

  return { points, loading };
}
