# Feature Spec: 001 Mango Trading MVP

> Source: `docs/Especificação de requisitos.pdf` §1-4 (12 RF, 9 RNF, 3 actors, 7 entities) + `readme.md` API ref | Status: Approved (implemented on `server/`) | Language: English

## Overview
Mango Trading is a fictitious-market trading simulator. Users start with virtual balance, trade stocks, manage portfolio, view history, and compete on a ranking by total patrimony. Backend is Spring Boot REST (`server/`), frontend Next.js (`web/`) decoupled via `HTTP/JSON` + JWT. This spec consolidates the MVP already implemented on `server/` and defines the contract for frontend parity.

## User Stories

### US1: Visitor — Register and Login
**As a** visitor **I want** to register and log in **so that** I can access the trading platform.

**Acceptance Criteria:**
- `Given` I am not authenticated `When` I `POST /api/auth/register {name,email,password}` `Then` I receive `201 UserResponse` with `balance=10000.00`, `role=USER` and a `Portfolio` is created; `400` if email exists or validation fails.
- `Given` I am registered `When` I `POST /api/auth/login {email,password}` `Then` I receive `200 JwtResponse {token,type:Bearer,id,name,email,role}`; `401` on bad credentials.

### US2: Auth & RBAC
**As a** user **I want** role-based access **so that** only admins manage the catalog.
- `Given` no token `When` I call any endpoint except `/api/auth/*` `Then` `401 "Acesso não autorizado"`.
- `Given` `ROLE_USER` `When` I call `/api/admin/**` `Then` `403`.
- `Given` `ROLE_ADMIN` `When` I call `/api/admin/**` `Then` `200/201/204` per verb.

### US3: Admin — CRUD Stocks
**As an** admin **I want** to CRUD stocks (`name,symbol,sector,currentPrice,volatility,active`) **so that** the market reflects the catalog.
- `Given` admin `When` `POST /api/admin/stocks` with `StockRequest` `Then` `201 StockResponse`, symbol uppercased, unique; `400` duplicate.
- `When` `PUT /api/admin/stocks/{id}` `Then` `200`; price change creates `StockPriceHistory`.
- `When` `DELETE /api/admin/stocks/{id}` `Then` `204`; proposed rule: block delete if linked `PortfolioItem`/`Transaction`, offer deactivation (see LEIA-ME:59).

### US4: User — View Stocks
**As a** user **I want** to list active stocks and see details **so that** I can decide trades.
- `Given` authenticated `When` `GET /api/stocks` `Then` `200 [StockResponse]` active only.
- `When` `GET /api/stocks/all` `Then` `200` all (admin helper).
- `When` `GET /api/stocks/{id}` `Then` `200` or `404`.

### US5: User — Buy Stocks
**As a** user **I want** to buy stocks **so that** I build my portfolio.
- `Given` authenticated `When` `POST /api/trades/buy {stockId,quantity}` with `quantity>0`, `stock.active=true`, `balance>=price*qty` `Then` `200 TransactionResponse BUY`, balance debited, `averagePrice` weighted `(oldQty*oldAvg+qty*price)/newQty` scale 4 `HALF_UP`, `PortfolioItem` created/updated, `Transaction` persisted.
- `Else` `400` insufficient balance/inactive, `404` not found.

### US6: User — Sell Stocks
**As a** user **I want** to sell stocks **so that** I realize cash.
- `Given` I own `PortfolioItem` `When` `POST /api/trades/sell {stockId,quantity}` with `quantity<=owned` `Then` `200 SELL`, balance credited `price*qty`, item decremented or removed if zero.
- `Else` `400` insufficient quantity, `404` not owned.

### US7: User — Balance Updates (RF08)
Covered by US5/US6 atomic balance updates. No partial commits.

### US8: User — Portfolio (RF09)
**As a** user **I want** to view my portfolio **so that** I track patrimony.
- `When` `GET /api/portfolio` `Then` `200 PortfolioResponse {balance, items[], totalInvested, totalCurrentValue, totalPatrimony, totalProfitLoss}` where `totalInvested=Σ avg*qty`, `totalCurrentValue=Σ currentPrice*qty`, `totalPatrimony=balance+totalCurrentValue`, per-item `profitLoss`, `profitLossPercent`.

### US9: Transaction History (RF10)
- `When` `GET /api/trades/history` `Then` `200 [TransactionResponse]` ordered `createdAt DESC`.

### US10: Ranking (RF12)
**As a** user **I want** to see ranking by patrimony.
- `When` `GET /api/ranking` `Then` `200 [RankingResponse {position,userId,userName,balance,stockValue,totalPatrimony}]` sorted `totalPatrimony DESC`.

### US11: Market Events (from admin events)
**As a** user **I want** to view market events **so that** I understand context.
- `When` `GET /api/events` `Then` `200 [MarketEventResponse]`. CRUD via `POST/PUT/DELETE /api/admin/events` admin-only.

### US12: Users Listing (admin)
- `When` `GET /api/admin/users` or `GET /api/admin/users/{id}` as admin `Then` `200` or `404`.

## Functional Requirements Mapping
| ID | Description | US |
|---|---|---|
| RF01 | Register | US1 |
| RF02 | Login | US1 |
| RF03 | RBAC | US2 |
| RF04 | Admin CRUD stocks | US3 |
| RF05 | View stocks | US4 |
| RF06 | Buy | US5 |
| RF07 | Sell | US6 |
| RF08 | Update balance | US7 |
| RF09 | Portfolio | US8 |
| RF10 | Transactions | US9 |
| RF11 | Patrimony calc | US8 |
| RF12 | Ranking | US10 |

## Non-Functional Mapping
| ID | Cat | Spec | Verification |
|---|---|---|---|
| RNF01 | Tech | Java 17+ | `pom.xml:16` |
| RNF02 | Tech | Spring Boot | `pom.xml:8` |
| RNF03 | Rel. | Real persistence | PostgreSQL, `ddl-auto=update` |
| RNF04 | Rel. | Relational DB | PostgreSQL |
| RNF05 | Interop | REST JSON | `openapi.yaml` |
| RNF06 | Sec | Auth & Authz | JWT HS256 + `SecurityConfig:68` |
| RNF07 | A11y | WCAG AA | semantic HTML, labels, ARIA, contrast |
| RNF08 | Usab | Responsive | Tailwind, mobile bottom nav |
| RNF09 | Maint | Layered | `controller→service→repository→entity` |

## Out of Scope
- Real money, real stocks, price engine automation (volatility/events are informational only).
- OAuth, 2FA, email verification.

## Dependencies
- PostgreSQL `mango_trading` DB, `POST /api/auth/register` creates `Portfolio`.

## Success Criteria
- `server: ./mvnw test` (H2) passes; all 22 endpoints match `openapi.yaml`; `GET /api/portfolio` math matches `PortfolioService:30`; `GET /api/ranking` ordering matches `RankingService:25`.

## Open Questions
- [ ] Adopt proposed no-delete-with-links rule formally? (LEIA-ME:59)
- [ ] `jwt.secret` rotation strategy?
