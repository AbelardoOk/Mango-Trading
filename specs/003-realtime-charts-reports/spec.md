# Feature Spec: 003 Real-time Charts & Reports

> Source: `docs/sdd/11-realtime.md` + `04-api-contracts.md` + `08-testing-quality.md` | Status: Implemented | Language: English

## Overview
Add real-time patrimony/price charts and downloadable CSV/PDF reports to Mango Trading. Charts consume existing SSE streams plus new history endpoints; reports are generated server-side so the client never assembles financial data.

## User Stories

### US1: Patrimony chart (dashboard/wallet)
**As a** player **I want** a patrimony chart updated in real time **so that** I can track my evolution.
- `Given` authenticated `When` dashboard/wallet renders `Then` `PatrimonyChart` shows the series from `GET /api/portfolio/history?range=1H|1D|7D|30D`.
- `When` `/api/stream/portfolio` emits `event: portfolio` `Then` the latest point is appended without full refetch; `LiveBadge` reflects connection.
- `Given` SSE unavailable `Then` polling fallback every 5s and a textual table remain available.

### US2: Stock price chart (market detail)
**As a** player **I want** a price chart per stock **so that** I can decide buy/sell.
- `When` `/market/{id}` renders `Then` `PriceChart` loads `GET /api/stocks/{id}/history?range=...` and appends live points from `stocks` SSE.
- `Given` empty history `Then` `ChartEmptyState` renders (no broken axes).

### US3: CSV/PDF reports
**As a** player/admin **I want** export buttons **so that** I can keep records.
- Player exports: trades (`from`, `to`, `type`), portfolio, ranking.
- Admin exports: stocks, users.
- `GET /api/reports/**?format=csv|pdf` returns `Content-Disposition: attachment`; CSV uses UTF-8 BOM + `;` and neutralizes spreadsheet formula injection; PDF uses OpenPDF.
- `Given` `ROLE_USER` `When` calling `/api/reports/admin/**` `Then` `403`.

## Out of Scope
- Tick-level intraday storage beyond `StockPriceHistory` sampling.
- Email/scheduled report delivery.
- Chart image export.

## Success Criteria
- `server`: `./mvnw test` green; new services covered.
- `web`: `bun run lint` + `npx tsc --noEmit` green.
- `openapi.yaml` validates and documents 30 endpoints.
- Charts accessible: labeled regions, textual fallback, no motion dependency.

## Open Questions
- [ ] Snapshot retention default (90 days) acceptable for demo?
- [ ] Add intraday snapshot frequency below 60s?
