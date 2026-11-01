# Implementation Plan: 003 Real-time Charts & Reports

> Spec: `spec.md` | SDD: `docs/sdd/11-realtime.md`, `04-api-contracts.md` | Status: Implemented

## Technical Design Pointers
- **Charts:** Recharts v3 (`web`), `AreaChart` with animations disabled for live updates.
- **History:** `StockPriceHistory` range query + downsample; portfolio reconstructed from `Transaction` + `StockPriceHistory`, merged with `PortfolioSnapshot`.
- **Live:** existing `SseService`; add per-user `portfolioEmitters` and `GET /api/stream/portfolio?token=`.
- **Reports:** server-side `CsvReportWriter` + `PdfReportBuilder` (OpenPDF 2.0.3, Java 17 compatible).
- **Security:** `/api/reports/admin/**` → `ROLE_ADMIN`; other reports authenticated.

## API Changes
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/stocks/{id}/history?range=1H\|1D\|7D\|30D` | price series |
| `GET` | `/api/portfolio/history?range=1H\|1D\|7D\|30D` | patrimony series |
| `GET` | `/api/stream/portfolio?token=` | per-user SSE |
| `GET` | `/api/reports/{trades,portfolio,ranking}` | player exports |
| `GET` | `/api/reports/admin/{stocks,users}` | admin exports |

## Data Model Changes
- New `PortfolioSnapshot` (`user_id`, `captured_at`, `balance`, `stock_value`, `patrimony`) + index `idx_portfolio_snapshot_user_captured`.
- New index `idx_stock_price_history_stock_created`.

## Backend Components
- `StockHistoryService`, `PortfolioHistoryService`, `PortfolioSnapshotScheduler`, `PortfolioSnapshotListener`.
- `TradeExecutedEvent` published by `TradingService` (`AFTER_COMMIT` capture).
- `ReportService`, `ReportController`, `ReportFile`, `CsvReportWriter`, `PdfReportBuilder`.

## Frontend Components
- `web/src/components/charts/{PatrimonyChart,PriceChart}.tsx`, `ChartEmptyState`, `LiveBadge`, `ExportMenu`.
- `web/src/hooks/{useStockHistory,usePortfolioHistory,usePortfolioStream}.ts`.
- `web/src/services/api/{client.apiDownload,reports}.ts`.

## Configuration
`PORTFOLIO_SNAPSHOT_ENABLED`, `PORTFOLIO_SNAPSHOT_DELAY_MS`, `PORTFOLIO_SNAPSHOT_RETENTION_DAYS`, `PORTFOLIO_SNAPSHOT_CLEANUP_CRON` in `application.properties`, `.env.example`, `docker-compose.yaml`.

## Testing
- Unit: `StockHistoryServiceTest`, `PortfolioHistoryServiceTest`, `CsvReportWriterTest`, `PdfReportBuilderTest`.
- H2 test profile disables scheduler; missing social/admin env keys defaulted in test properties.

## Rollout
1. Backend history + snapshots + SSE.
2. Reports.
3. Frontend charts/export on dashboard, wallet, market detail, history, ranking, admin.
