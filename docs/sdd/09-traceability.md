# 09 — Traceability Matrix

> Source: ERS §3.1-3.4 + prototype LEIA-ME table + `controller/service/entity` | Status: 001 baseline + 002 planned

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
| 07 | Compra concluída | `07-compra-concluida.png/svg` | RF06 | `/market/success` |
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

- Controllers grep `22` endpoints (`@*Mapping`). `openapi.yaml` declares `22` paths — parity ✅.
