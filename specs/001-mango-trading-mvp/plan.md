# Implementation Plan: 001 Mango Trading MVP

> Spec: `spec.md` | SDD: `docs/sdd/` | Status: Baseline implemented on `server/`, frontend pending

## Overview
Baseline `server/` already satisfies `spec.md` US1-US12. This plan links spec → SDD → code and defines remaining `web/` work.

## Technical Design Pointers
- **Vision:** `docs/sdd/01-overview.md`
- **Architecture:** `docs/sdd/02-architecture.md` (decoupled, CORS `SecurityConfig:68`, Next App Router)
- **Data Model:** `docs/sdd/03-data-model.md` (7 entities, ER, constraints)
- **API:** `docs/sdd/04-api-contracts.md` + `docs/sdd/openapi.yaml` (22 endpoints, `Bearer` auth)
- **Business Rules:** `docs/sdd/05-business-rules.md` (`averagePrice` weighted, patrimony, ranking)
- **Security:** `docs/sdd/06-security.md` (JWT HS256 24h, BCrypt, RBAC)
- **Frontend:** `docs/sdd/07-frontend.md` (prototype screens → routes)
- **Testing:** `docs/sdd/08-testing-quality.md`
- **Traceability:** `docs/sdd/09-traceability.md` (100% RF/RNF coverage)

## Architecture Decisions
| Decision | Option | Rationale |
|---|---|---|
| `ddl-auto=update` MVP | vs Flyway | Speed for 0.0.1, migrate to `validate`+migrations post-MVP |
| Symbol uppercase unique | vs case-sensitive | Matches market tickers, prevents `MANG3`/`mang3` dupes |
| Proposed no-delete-with-links | vs hard delete | Preserve `Transaction`/`PortfolioItem` history (LEIA-ME:59) |
| H2 for tests | vs Testcontainers PG | No Docker required for `./mvnw test` |
| `openapi.yaml` file-checked | vs generated only | Agent can validate without running server |

## Data Model Changes
None for 001 baseline. If adopting no-delete rule, add `StockService` guard throwing `BadRequestException` when `existsByStockId`.

## API Changes
None for 001 baseline. Documented in `openapi.yaml` (implemented).

## Frontend Changes (pending)
Implement `web/` per `docs/sdd/07-frontend.md` § routes:
- `app/(auth)/login|register` (US1)
- `app/(dashboard)/` — overview, patrimony chart
- `app/market` (US4/US5/US6)
- `app/wallet` (US8)
- `app/history` (US9)
- `app/ranking` (US10)
- `app/admin/stocks|events|users` (US3/US11/US12)

## Security & Auth
- `JwtAuthenticationFilter` validates `Authorization: Bearer <token>`; `JwtAuthenticationEntryPoint` `401`; `ROLE_*` checked per route.

## Testing Strategy
- `server`: unit (`TradingService` buy/sell edge, `PortfolioService` math) + integration (`AuthController` 201/401, `TradingController` 400).
- `web`: `bun run lint`, `axe` on auth/market/wallet pages; E2E `register→login→buy→portfolio→ranking`.

## Rollout & Risks
- Risk: `html` prototype has no backend—ensure agent does not copy virtual balance logic (`M$ 4200`) as real.
- Mitigation: prototype marked `read-only` in `docs/sdd/assets/prototype/`.

## Traceability
Update `docs/sdd/09-traceability.md` after any change; this plan is the pointer that spec-kit agents follow.
