"use client";
import { useEffect, useRef, useState } from "react";
import { getStockHistory } from "@/services/api/stocks";
import { PricePoint } from "@/types/api";

export function useStockHistory(stockId: number, range: string, livePrice?: number | null) {
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const lastAppend = useRef(0);

  useEffect(() => {
    let active = true;
    getStockHistory(stockId, range)
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
  }, [stockId, range]);

  useEffect(() => {
    if (livePrice == null || !Number.isFinite(livePrice)) return;
    const now = Date.now();
    if (now - lastAppend.current < 4000) return;
    lastAppend.current = now;

    setPoints((current) => {
      const next = [...current];
      const point = { timestamp: new Date(now).toISOString(), price: livePrice };
      if (next.length === 0) return [point];
      const last = next[next.length - 1];
      if (now - new Date(last.timestamp).getTime() < 30000) {
        next[next.length - 1] = point;
      } else {
        next.push(point);
      }
      return next;
    });
  }, [livePrice]);

  return { points, loading };
}
