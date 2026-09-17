# 11 — Realtime (SSE)

> Source: `server/src/main/java/.../service/SseService.java:1` + `controller/StreamController.java:1` + `service/EventScheduler.java:55` + `web/src/hooks/useStockStream.ts:1` | Prototype: market 04

## 11.1 Why SSE vs Polling

| Aspect | Polling (previous) | SSE (current) |
|---|---|---|
| `market` `listStocks()` | 1× on mount, `listEvents()` every 30s | `EventSource` push <100ms |
| `EventScheduler` price change | client sees only on next poll/F5 (≤30s) | `SseService.broadcastStocks()` immediately after `StockPriceHistory` save |
| 100 users, 5s poll | 3.600 req/min, 3.600 SELECTs | 100 conns + ~2 pushes/min (RANDOM 1-2m) → ~200 msg/min |
| Latência | até 5s | <100ms |
| Complexidade | `setInterval(fetch)` | `SseEmitter` + `EventSource` + reconexão |

Polling kept as **fallback** on `onerror` (5s) and for `portfolio` (5s, user-specific, not broadcast).

## 11.2 Architecture

```
[EventScheduler] tick 30s
  ├─ if due → compute deltaPerStock (sum, clamp 15%, volFactor) → stockRepository.save + StockPriceHistory
  │           → sseService.broadcastStocks(findActive()) + broadcastEvents(findVisibleForPlayer())
  └─ else → sseService.broadcastEvents(findVisibleForPlayer()) // keep UPCOMING countdown fresh
        │
        ▼
[SseService] CopyOnWriteArrayList<SseEmitter> (stocks, events)
        │
        ▼
[StreamController] GET /api/stream/stocks?token=...  GET /api/stream/events?token=...
  - Auth via ?token= query (EventSource cannot send Authorization header) → JwtTokenProvider.validateToken()
  - SecurityConfig.java:45 permitAll("/api/stream/**"), validated inside controller
  - Produces text/event-stream, event names "stocks"/"events", data = JSON string
        │
        ▼
[web] EventSource(`${API_URL}/api/stream/stocks?token=${localStorage.token}`)
  → addEventListener("stocks", e => setStocks(JSON.parse(e.data)))
  → onopen => connected=true (UI "Tempo real ●")
  → onerror => close + fallback setInterval(listStocks,5000) + reconnect 5s
```

**Files:**
- `server/.../service/SseService.java:10` — 2 emitter lists, `subscribeStocks/Events()`, `broadcastStocks/Events()` via `ObjectMapper` (tools.jackson, JavaTimeModule)
- `server/.../controller/StreamController.java:20` — `GET /api/stream/stocks|events?token=` → `subscribe` + initial snapshot `findActive()/findVisibleForPlayer()`
- `server/.../service/EventScheduler.java:57` — `@EnableScheduling` in `MangoTradingApplication.java:7`, `@Scheduled(fixedDelay=30s)`, `broadcastStocks/Events` after tick
- `web/src/hooks/useStockStream.ts:1` + `useEventStream.ts:1` — `getToken()` from localStorage, `EventSource`, `JSON.parse`, fallback polling
- `web/src/app/(app)/market/page.tsx:12` — `useStockStream()` + `useEventStream()` + `formatRemaining(endDate)` with `now` tick 1s, banners `EVENTO IMINENTE` (UPCOMING) + `EVENTO ATIVO` (ACTIVE)

## 11.3 API

| Method | Path | Auth | Response |
|---|---|---|---|
| `GET` | `/api/stream/stocks?token=` | `?token` Bearer | `text/event-stream` `event: stocks` `data: [StockResponse]` |
| `GET` | `/api/stream/events?token=` | `?token` | `event: events` `data: [MarketEventResponse]` with `status, secondsToStart, nextRunAt` |

Existing `GET /api/stocks`, `GET /api/events` remain for fallback and initial load. New `MarketEvent` fields (`nextRunAt`, `status`, `secondsToStart`) already in `openapi.yaml`.

## 11.4 Frontend Behavior

- **Market:** `stocks` via SSE (<100ms price change), `events` via SSE (UPCOMING 3min before + ACTIVE). `now` state 1s tick for `faltam X horas e Y minutos para acabar o evento` (endDate - now).
- **Wallet/Dashboard:** `portfolio` polling 5s (`getPortfolio` + `getRanking`) — cheap, user-specific, not broadcast (would need per-user SSE). When `stocks` SSE fires, `portfolio` will update within 5s.
- **Admin:** `admin/stocks` list still fetch (admin needs not realtime), but `admin/events` list could also use SSE in future.

## 11.5 Env & Config

`application.properties:22` `events.scheduler.*`, `docker-compose.yaml:36` `EVENTS_*`, `.env.example:31` — no new env for SSE (uses same `NEXT_PUBLIC_API_URL`).

## 11.6 Failure & Fallback

- `EventSource` `onerror` → close, `setConnected(false)`, start `setInterval(listStocks,5000)` fallback, retry `connect()` in 5s.
- `SseEmitter` `onCompletion/onTimeout/onError` → remove from list.
- `curl -N "http://localhost:8080/api/stream/stocks?token=$TOKEN"` returns `event:init` + `event:stocks` + periodic pushes.

## 11.7 Verification

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login -d '{"email":"admin@mango.local","password":"admin123"}' | jq -r .token)
curl -N "http://localhost:8080/api/stream/stocks?token=$TOKEN" # expect event:stocks
# trigger event:
curl -X POST http://localhost:8080/api/admin/events/3/trigger -H "Authorization: Bearer $TOKEN"
# within <100ms, SSE clients receive new stocks with updated currentPrice
docker compose logs server | grep EventScheduler # deltaSum logs
```

## 11.8 Future

- Per-user `GET /api/stream/portfolio?token=` (requires userId from token → portfolio).
- WebSocket for bidirectional (not needed, SSE sufficient for price push, POST for buy/sell).
