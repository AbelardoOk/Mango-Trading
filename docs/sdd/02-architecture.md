# 02 — Architecture

> Source: ERS §2.1 Perspective, §2.4 Restrictions | Code: `server/src/main/java/...`, `web/src/app/*` | Prototype: `LEIA-ME.md`

## 2.1 System Context

```
[Browser]
   │
   │ HTTPS / JSON
   ▼
[web] Next 16 + React 19 + TS 5 + Tailwind 4  (localhost:3000)
   │  App Router: app/(auth)/, app/(app)/, app/(admin)/
   │  contexts/AuthContext, hooks/usePortfolio, services/api/client.ts
   │  NEXT_PUBLIC_API_URL=http://localhost:8080
   │
   │  Authorization: Bearer <JWT>
   ▼
[server] Spring Boot 4.1.1 (localhost:8080)  — stateless REST
   │  controller → service → repository → entity
   │  security: JwtAuthenticationFilter, JwtTokenProvider (HS256)
   │
   ▼
[PostgreSQL 14]  mango_trading  (localhost:5432)
   H2 in tests (src/test/resources/application.properties)
```

**CORS:** `config/SecurityConfig.java:68` allows `http://localhost:5173`, `http://localhost:3000`.

## 2.2 Backend Layers

```
server/src/main/java/com/mangotrading/mangotrading/
├── MangoTradingApplication.java
├── config/SecurityConfig.java
├── security/ (JwtTokenProvider, JwtAuthenticationFilter, JwtAuthenticationEntryPoint, UserDetailsImpl, CustomUserDetailsService)
├── controller/ (9: Auth, Stock, Trading, Portfolio, Ranking, MarketEvent, AdminStock, AdminMarketEvent, AdminUser)
├── service/ (7: Auth, Stock, MarketEvent, Portfolio, Trading, Ranking, User)
├── repository/ (7 JpaRepository: User, Stock, Portfolio, PortfolioItem, Transaction, StockPriceHistory, MarketEvent)
├── entity/ (7 + enums Role, TransactionType, MarketImpact)
├── dto/request (5) + dto/response (8)
└── exception/ (GlobalExceptionHandler + 4 custom)
```

`src/main/resources/application.properties:4-18` — `datasource url postgres`, `ddl-auto=update`, `jwt.secret`, `jwt.expiration-ms=86400000`.

## 2.3 Frontend Architecture

```
web/
├── package.json: Next 16.3.5, React 19.2.8, Tailwind 4, bun
├── src/app/
│   ├── page.tsx          # 00-capa.png (cover)
│   ├── layout.tsx        # RootLayout with Geist fonts
│   ├── (auth)/login|register  # 01,02
│   ├── (app)/market, wallet, history, ranking, page (dashboard)  # 03-10
│   ├── (admin)/admin/stocks, events, users  # 11-17
│   └── guide/            # 20,21,22
├── src/components/       # StockTable, StockCard, TradeForm, MetricCard, Dialog, Sidebar, MobileBar
├── src/services/api/     # client.ts (Bearer interceptor)
├── src/contexts/         # AuthContext
├── src/hooks/            # usePortfolio, useAuth
└── src/types/            # api.ts (from openapi.yaml)
```

Target structure per ERS §2.1: `components, pages, services, hooks, contexts, routes, types`.

## 2.4 Key Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Decoupled | REST JSON only, no `static/` serving | ERS §2.1, allows independent FE/BE |
| `ddl-auto=update` | vs Flyway | MVP speed; future `validate` + migrations |
| `open-in-view=false` | — | `application.properties:14` explicit |
| `jjwt 0.12.6` HS256 | — | `pom.xml:18` |
| `bun` for web | — | `web/package.json:packageManager` |
| Mobile bottom nav | `@media(max-width:800px)` in `mango-trading.html` | Replica prototype `mobilebar` |

## 2.5 Deployment View

```
Browser ── :3000 ──► [web] Next ── NEXT_PUBLIC_API_URL http://localhost:8080 ──► [server] :8080 ──► [db] postgres:5432/mango_trading
              │              mango-net  (browser→server via localhost)                │  pgdata volume
```

- **Prod:** `docker compose -f docker-compose.yaml up --build -d` — `server/Dockerfile` (eclipse-temurin:17 JRE) + `web/Dockerfile` (oven/bun:1.3.6 standalone, `output:"standalone"` in `next.config.ts:4`), `postgres:16-alpine` + `pgdata` volume, healthchecks.
- **Dev:** `docker compose up --build` (merges `docker-compose.override.yaml`) — `server` `./mvnw spring-boot:run` live (devtools) + `web` `bun run dev` hot-reload + Tailwind watch, volumes `./server/src:/app/src` + `./web:/app`.
- **DB Admin:** `docker compose --profile tools up -d` → `pgAdmin :5050` (`dpage/pgadmin4:8`).
- **Env:** `.env` required (see `.env.example`), `SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/mango_trading` inside compose (vs `localhost` outside), `JWT_SECRET`, `NEXT_PUBLIC_API_URL=http://localhost:8080` (browser).
- **Local without Docker:** `server: ./mvnw spring-boot:run` → `8080`; `web: bun dev` → `3000`.
- Env keys: `NEXT_PUBLIC_API_URL`, `SPRING_DATASOURCE_URL/USERNAME/PASSWORD`, `JWT_SECRET`, `POSTGRES_*`, `PGADMIN_*`.

## 2.6 Constraints (ERS §2.4)
- Java 17+, React+TS separate, PostgreSQL real, REST JSON, Spring Security for admin, virtual money only.
