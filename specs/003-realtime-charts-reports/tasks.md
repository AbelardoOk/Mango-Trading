# Tasks: 003 Real-time Charts & Reports

> Spec: `spec.md` | Plan: `plan.md` | Mark `[x]` when done

## Phase 1 — Backend History
- [x] T001 Add `StockPriceHistoryRepository` range/last-price queries + index
- [x] T002 Add `PricePointResponse` + `StockHistoryService` + `GET /api/stocks/{id}/history`
- [x] T003 Add `PortfolioSnapshot` entity/repository + index
- [x] T004 Add `PortfolioHistoryService` (reconstruction + snapshot merge)
- [x] T005 Add `PortfolioSnapshotScheduler` + `PortfolioSnapshotListener` + `TradeExecutedEvent`
- [x] T006 Add `PortfolioHistoryPointResponse`, `PortfolioLiveResponse`, `GET /api/portfolio/history`
- [x] T007 Add per-user SSE `portfolioEmitters` + `GET /api/stream/portfolio?token=`

## Phase 2 — Backend Reports
- [x] T010 Add OpenPDF 2.0.3 dependency
- [x] T011 Add `CsvReportWriter` (BOM, `;`, injection guard) + `PdfReportBuilder`
- [x] T012 Add `ReportService` + `ReportController` for trades/portfolio/ranking/admin stocks/admin users
- [x] T013 Secure `/api/reports/admin/**` as `ROLE_ADMIN`

## Phase 3 — Frontend
- [x] T020 Add `recharts` + chart types in `web/src/types/api.ts`
- [x] T021 Add `apiDownload` + `getStockHistory`/`getPortfolioHistory`/`reports` services
- [x] T022 Add `useStockHistory`, `usePortfolioHistory`, `usePortfolioStream` (SSE + polling fallback)
- [x] T023 Add `PatrimonyChart`, `PriceChart`, `LiveBadge`, `ChartEmptyState`, `ExportMenu`
- [x] T024 Wire dashboard/wallet (patrimony + live badge + export)
- [x] T025 Wire market detail (price chart + range selector)
- [x] T026 Wire history/ranking/admin stocks/admin users exports

## Phase 4 — Quality
- [x] T030 Add unit tests `StockHistoryServiceTest`, `PortfolioHistoryServiceTest`, `CsvReportWriterTest`, `PdfReportBuilderTest`
- [x] T031 Test profile env defaults + disable scheduler
- [x] T032 `./mvnw test` green
- [x] T033 `bun run lint` + `npx tsc --noEmit` green
- [x] T034 Update `openapi.yaml`, `04-api-contracts.md`, `09-traceability.md`, `11-realtime.md`
