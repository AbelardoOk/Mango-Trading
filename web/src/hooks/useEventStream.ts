"use client";
import { useEffect, useRef, useState } from "react";
import { API_URL } from "@/lib/env";
import { MarketEventResponse } from "@/types/api";
import { listEvents } from "@/services/api/events";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function useEventStream(initial: MarketEventResponse[] = []) {
  const [events, setEvents] = useState<MarketEventResponse[]>(initial);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    let fallback: ReturnType<typeof setInterval> | null = null;

    function connect() {
      const token = getToken();
      if (!token) {
        fallback = setInterval(() => listEvents().then(setEvents).catch(() => {}), 30000);
        return;
      }
      const url = `${API_URL}/api/stream/events?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("events", (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data);
          if (Array.isArray(data)) setEvents(data);
        } catch {}
      });
      es.addEventListener("init", () => setConnected(true));
      es.onerror = () => {
        setConnected(false);
        es.close();
        fallback = setInterval(() => listEvents().then(setEvents).catch(() => {}), 10000);
        setTimeout(connect, 5000);
      };
      es.onopen = () => setConnected(true);
    }

    listEvents().then(setEvents).catch(() => {});
    connect();

    return () => {
      esRef.current?.close();
      if (fallback) clearInterval(fallback);
    };
  }, []);

  return { events, setEvents, connected };
}
