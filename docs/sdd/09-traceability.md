# 09 — Traceability Matrix

> Source: ERS §3.1-3.4 + prototype LEIA-ME table + `controller/service/entity` | Status: 001 baseline + 002 planned + 003 realtime/reports + 004 player UX

## 09.1 RF → SDD → Code → Prototype Screen → Spec/Tasks

| RF | Description | SDD | Code (controller/service/entity) | Prototype Screen | Spec/Plan | Status |
|---|---|---|---|---|---|---|
| RF01 | Register | `04-api-contracts.md#auth`, `05 RB01`, `06` | `AuthController:register`, `AuthService`, `User`, `Portfolio` | `02-cadastro-usuario.png` | `001 spec US1` | ✅ server |
| RF02 | Login | `04`, `05 RB01`, `06` | `AuthController:login`, `AuthService`, `JwtTokenProvider:60` | `01-login.png` | `001 US1` | ✅ |
| RF03 | RBAC | `02`, `06:6.2` | `SecurityConfig:68`, `Admin*Controller`, `Role` | `20-guia.png` (Visitante/User/Admin) | `001 US2` | ✅ |
| RF04 | Admin CRUD stocks | `04 admin/stocks`, `05 RB07/RB09` | `AdminStockController`, `StockService:60`, `Stock`, `StockPriceHistory` | `11-admin-listagem.png`..`14-admin-exclusao.png` | `001 US3` | ✅ |
| RF05 | View stocks | `04 /stocks`, `03 Stock` | `StockController`, `StockService`, `Stock` | `04-mercado.png`, `23-mobile-mercado.png` | `001 US4` | ✅ (web pending 002 T012) |
| RF06 | Buy | `05 RB02` | `TradingController:buy`, `TradingService:22` | `05-compra.png`, `18-saldo-insuficiente.png` | `001 US5` | ✅ server |
| RF07 | Sell | `05 RB03` | `TradingController:sell`, `TradingService:73` | `06-venda.png` | `001 US6` | ✅ |
| RF08 | Update balance | `05 RB02/03` | `User.balance`, `TradingService` | `05,06` totals + `07-compra-concluida.png` | `001 US7` | ✅ |
| RF09 | Portfolio | `05 RB04`, `04 /portfolio` | `PortfolioController`, `PortfolioService:30`, `PortfolioItem` | `08-carteira.png`, `19-carteira-vazia.png` | `001 US8` | ✅ server |
| RF10 | Transactions | `04 /history`, `03 Transaction` | `TradingController:history`, `TransactionRepository` | `09-historico.png` | `001 US9` | ✅ |
| RF11 | Patrimony calc | `05 RB04` | `PortfolioService:30`, `RankingService:25` | `03-visao-geral.png`, `08` | `001 US8` | ✅ |
| RF12 | Ranking | `05 RB05`, `04 /ranking` | `RankingController`, `RankingService:25` | `10-ranking.png` | `001 US10` | ✅ |
| (events) | List events (user) + CRUD admin | `04 /events`, `/admin/events` | `MarketEventController`, `AdminMarketEventController`, `MarketEventService` | `15-eventos.png`, `16-evento-formulario.png` | `001 US11` | ✅ server |
| (users) | List users admin | `04 /admin/users` | `AdminUserController`, `UserService` | `17-usuarios.png` | `001 US12` | ✅ server |
| (charts) | Real-time patrimony/price charts | `11`, `04 Charts` | `StockHistoryService`, `PortfolioHistoryService`, `SseService`, `StreamController`, `PortfolioController` | `03-visao-geral.png`, `04-mercado.png`, `08-carteira.png` | `003 US1/US2` | ✅ |
| (reports) | CSV/PDF report export | `04 Reports` | `ReportController`, `ReportService`, `CsvReportWriter`, `PdfReportBuilder` | `03,08,09,10,11,17` | `003 US3` | ✅ |
| (ux) | Player UX: shell, dashboard, market/trade, wallet, history, ranking, onboarding, guide | `07`, `11`, `08:8.2` | Web only: `components/ui/*`, `Shell`, `PortfolioContext`, `(app)`/`(admin)` layouts, player pages | `00`–`10`, `18`–`24` | `004 US1–US4` | ✅ |

## 09.2 RNF → SDD → Verification

| RNF | Cat | SDD | Verification |
|---|---|---|---|
| RNF01 | Tech Java 17+ | `02:2.2`, `.specify/constitution:2` | `pom.xml:16 java.version 17` |
| RNF02 | Tech Spring Boot | `02` | `pom.xml:8 parent 4.1.1` |
| RNF03 | Real persistence | `02:2.1`, `03` | PG `mango_trading`, `08:8.5` |
| RNF04 | Relational | `02`, `03` | PG |
| RNF05 | REST JSON | `04` + `openapi.yaml` | curl examples |
| RNF06 | Auth & Authz | `06` | JWT HS256 24h, `SecurityConfig:68` |
| RNF07 | A11y WCAG AA | `07:7.5`, `08:8.2` | axe, semantic, `21-acessibilidade.png` |
| RNF08 | Responsive | `07` | `@media 800px`, `23,24-mobile` |
| RNF09 | Layered | `02:2.2` | `controller→service→repository→entity` |

## 09.3 Prototype Screen Inventory (from `~/Downloads/MangoTrading_Entrega_Interface`)

| # | Screen | File | RF/RNF | Route (002) |
|---|---|---|---|---|
| 00 | Capa | `00-capa.png/svg` | — | `/` |
| 01 | Login | `01-login.png/svg` | RF02 | `/login` |
| 02 | Cadastro | `02-cadastro-usuario.png/svg` | RF01 | `/register` |
| 03 | Visão geral | `03-visao-geral.png/svg` | RF09-11 | `/(app)/` |
| 04 | Mercado | `04-mercado.png/svg` | RF05 | `/market` |
| 05 | Compra | `05-compra.png/svg` | RF06-08 | `/market/[symbol]` buy |
| 06 | Venda | `06-venda.png/svg` | RF07 | `/market/[symbol]` sell |
| 07 | Compra concluída | `07-compra-concluida.png/svg` | RF06 | `/market/[id]` — feedback toast + inline card (sem rota `/market/success` separada) |
| 08 | Carteira | `08-carteira.png/svg` | RF09-11 | `/wallet` |
| 09 | Histórico | `09-historico.png/svg` | RF10 | `/history` |
| 10 | Ranking | `10-ranking.png/svg` | RF12 | `/ranking` |
| 11 | Admin listagem | `11-admin-listagem.png/svg` | RF04 | `/admin/stocks` |
| 12 | Admin cadastro | `12-admin-cadastro.png/svg` | RF04 | `/admin/stocks/new` |
| 13 | Admin edição | `13-admin-edicao.png/svg` | RF04 | `/admin/stocks/[id]/edit` |
| 14 | Admin exclusão | `14-admin-exclusao.png/svg` | RF04 RB09 | dialog |
| 15 | Eventos | `15-eventos.png/svg` | Events | `/admin/events` |
| 16 | Evento formulário | `16-evento-formulario.png/svg` | Events | `/admin/events/new` |
| 17 | Usuários | `17-usuarios.png/svg` | Users | `/admin/users` |
| 18 | Saldo insuficiente | `18-saldo-insuficiente.png/svg` | RF06-08 | buy error |
| 19 | Carteira vazia | `19-carteira-vazia.png/svg` | RF09 | wallet empty |
| 20 | Guia | `20-guia.png/svg` | RF03 | `/guide` |
| 21 | Acessibilidade | `21-acessibilidade.png/svg` | RNF07-08 | `07:7.5` spec |
| 22 | Mapa requisitos | `22-mapa-requisitos.png/svg` | All | `09.1` table |
| 23 | Mobile mercado | `23-mobile-mercado.png/svg` | RNF08 | `/market` mobile |
| 24 | Mobile compra | `24-mobile-compra.png/svg` | RF06 RNF08 | `/market/[symbol]` mobile |

Count: `png 25, svg 26` (including `LEIA-ME.txt` in icons folder, not a screen).

## 09.4 Endpoints vs OpenAPI

- Controllers grep `30` endpoints (`@*Mapping`). `openapi.yaml` declares `30` paths — parity ✅.
- Added in `003`: `GET /api/stocks/{id}/history`, `GET /api/portfolio/history`, `GET /api/stream/portfolio`, and 5 `/api/reports/**` exports (CSV/PDF).

## 09.5 Feature 004 — Player UX improvements

| Item | Detail |
|---|---|
| Spec/Plan/Tasks | `specs/004-player-ux-improvements/{spec,plan,tasks}.md` |
| Dependencies | `lucide-react@1.66.0` |
| Foundation | `web/src/app/globals.css` (semantic tokens, Geist body, motion/a11y), `web/src/lib/cn.ts` |
| UI kit | `web/src/components/ui/{Button,Card,Badge,StatCard,PageHeader,Input,Select,Textarea,Modal,Toast,Skeleton,EmptyState}.tsx` |
| Shared state | `web/src/contexts/PortfolioContext.tsx`, `web/src/hooks/usePortfolioStream.ts` |
| Layouts | `web/src/app/(app)/layout.tsx`, `web/src/app/(admin)/layout.tsx` |
| Shell | `web/src/components/Shell.tsx` (icons, balance chip, user menu, skip link, responsive nav) |
| Player pages | `web/src/app/(app)/{dashboard,market,wallet,history,ranking}/page.tsx` + `market/[id]/page.tsx` |
| Charts | `web/src/components/charts/{PatrimonyChart,PriceChart,AllocationChart,LiveBadge}.tsx` |
| Onboarding | `web/src/components/OnboardingChecklist.tsx`, `web/src/lib/onboarding.ts` |
| Public/auth | `web/src/app/{page,login,register}/page.tsx`, `web/src/app/guide/page.tsx` |
| Admin aligned | wrapper removal in `(admin)` pages; `adminGetEvent` in `web/src/services/api/admin.ts` |
| P0 fixes | variation uses price change; ranking by `userId`; conditional Top 10; sell deep link; disabled invalid order submit; `/guide` exists; success feedback |
| Verification | `web: bun run lint`, `npx tsc --noEmit`, `bun run build` all green; `server: ./mvnw test` green (8 tests) |
| Out of scope | gamification phase 3, URL filter persistence, prototype asset changes |
