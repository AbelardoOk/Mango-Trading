# 📈 Mango Trading — Simulador de Mercado Financeiro

Simulador de trading com ações fictícias. Usuários operam com **saldo virtual** (sem dinheiro real), gerenciam carteira, visualizam histórico e competem em ranking por patrimônio total.

> ⚠️ Empresas, ações, preços e eventos são fictícios. Arquitetura **desacoplada**: `web (Next.js)` ↔ `server (Spring Boot REST)` ↔ `PostgreSQL`. Documentação técnica em `docs/sdd/` (SDD em inglês para agentes) e contrato em `docs/sdd/openapi.yaml`.

## 🧭 Sumário
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Como rodar — Docker (recomendado)](#-como-rodar--docker-recomendado)
- [Como rodar — sem Docker](#-como-rodar--sem-docker)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Autenticação e Perfis](#-autenticação-e-perfis)
- [Referência da API](#-referência-da-api)
- [Modelos de Dados](#-modelos-de-dados)
- [Regras de Negócio](#-regras-de-negócio)
- [Erros](#-erros)
- [Exemplos para o Front](#-exemplos-para-o-front)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Documentação SDD e Protótipo](#-documentação-sdd-e-protótipo)
- [Desenvolvimento e Testes](#-desenvolvimento-e-testes)

## 🏗️ Arquitetura

```
Browser ── :3000 ──► [web] Next 16 + React 19 + Tailwind 4  ── NEXT_PUBLIC_API_URL http://localhost:8080 ──► [server] Spring Boot 4.1.1 :8080 ──► [db] PostgreSQL 16 :5432/mango_trading
              │              mango-net (compose)  web → server via localhost (browser)                   │  pgdata volume
              └─ pgAdmin :5050 (profile tools) ────────────────────────────────────────────────────────────┘
```

- **Desacoplado:** `server` é API REST pura (`controller → service → repository → entity` + `dto` + `security` + `exception`). `web` é Next.js App Router (`src/app/*`) que consome via `HTTP/JSON`.
- **CORS:** `http://localhost:3000` e `http://localhost:5173` em `server/src/main/java/com/mangotrading/mangotrading/config/SecurityConfig.java:68`.
- **Compose:** `docker-compose.yaml` (prod: `db` + `server` multi-stage JRE + `web` standalone) + `docker-compose.override.yaml` (dev: hot-reload). Ver `docs/sdd/02-architecture.md`.

## 🛠️ Tecnologias

**Back-end:** Java 17, Spring Boot 4.1.1, Spring WebMVC, Spring Data JPA, Spring Security + JWT `jjwt 0.12.6` HS256, Hibernate, PostgreSQL 16 (H2 para testes), Maven 3.9+, Lombok.

**Front-end:** Next.js 16.3.5, React 19.2.8, TypeScript 5, Tailwind 4, `bun 1.3.6` (`web/package.json:26`), `output: "standalone"` em `web/next.config.ts:4`.

**Infra:** Docker 29+ + Compose v5.5+, `postgres:16-alpine`, `dpage/pgadmin4:8` (opcional), rede `mango-net`, volume `pgdata`.

## 📋 Pré-requisitos

- Docker + Docker Compose v5
- Para rodar sem Docker: Java 17+, Maven 3.9+, Node 20+ / `bun 1.3.6`, PostgreSQL 14+
- `cp .env.example .env` — **obrigatório** (`.env` é gitignored, ver `.gitignore:2`). Sem `.env` o compose falha (`:?` requer `POSTGRES_PASSWORD`, `JWT_SECRET`).

## 🚀 Como rodar — Docker (recomendado)

### 1. Configurar env
```bash
cp .env.example .env
# edite se quiser, mas os defaults já funcionam para dev
cat .env
```

### 2. Dev — hot-reload (override automático)
```bash
docker compose up --build
# web:   http://localhost:3000  (bun run dev + Tailwind watch, volume ./web:/app)
# server http://localhost:8080  (./mvnw spring-boot:run + devtools restart, volume ./server/src:/app/src)
# db     localhost:5432/mango_trading (pgdata persistido)
# logs: docker compose logs -f web server db
```
`docker-compose.override.yaml:6` monta `server/src` e `web/` para live reload — não precisa rebuild ao editar código.

### 3. Prod — imagens otimizadas
```bash
docker compose -f docker-compose.yaml up --build -d
# server: eclipse-temurin:17-jre (jar multi-stage)
# web:    oven/bun:1.3.6-slim standalone (next build)
docker compose ps
docker compose logs -f
```

### 4. pgAdmin (opcional)
```bash
docker compose --profile tools up -d
# http://localhost:5050  (PGADMIN_DEFAULT_EMAIL=admin@mango.local / PGADMIN_DEFAULT_PASSWORD=admin em .env)
# Server → Host: db, Port: 5432, DB: mango_trading, User: postgres
```

### 5. Parar
```bash
docker compose down        # mantém pgdata
docker compose down -v     # apaga dados (cuidado)
```

### Healthchecks
- `db`: `pg_isready -U postgres -d mango_trading` (10s)
- `server`: `curl -f http://localhost:8080/error` (40s start)
- `web` (prod): `curl -f http://localhost:3000/`

## 🔧 Como rodar — sem Docker

### Banco (se fora do compose)
```sql
CREATE DATABASE mango_trading;
-- ajuste em .env ou application.properties se precisar
```

### Back-end (sem Docker, usa localhost)
```bash
# usa .env ou defaults de src/main/resources/application.properties:4
cd server
./mvnw spring-boot:run        # API em http://localhost:8080
# sem .env, Spring usa SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/mango_trading
```
Propriedades sobrescritas por env: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME/PASSWORD`, `JWT_SECRET`, `SERVER_PORT=8080` (`application.properties:4`).

Testes (H2 em memória, sem Postgres):
```bash
cd server && ./mvnw test
```

### Front-end (sem Docker)
```bash
cd web
bun install
# .env local para web: NEXT_PUBLIC_API_URL=http://localhost:8080 (já em .env.example)
bun run dev   # http://localhost:3000
# build prod local:
bun run build && bun start
bun run lint && npx tsc --noEmit  # verificação
```

## 🔑 Variáveis de Ambiente

Todas em `.env.example:1` (copie para `.env`):

| Var | Default | Onde usada |
|---|---|---|
| `POSTGRES_DB/USER/PASSWORD/PORT` | `mango_trading/postgres/postgres/5432` | `docker-compose.yaml:6` `db` + `server` JDBC `jdbc:postgresql://db:5432/mango_trading` |
| `SERVER_PORT` | `8080` | `application.properties` + compose `8080:8080` |
| `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | `jdbc:postgresql://db:5432/...` | `server` env (sobrescreve `localhost` quando em Docker) |
| `JWT_SECRET/JWT_EXPIRATION_MS` | `5367...7437 / 86400000 (24h)` | `application.properties:16` + `JwtTokenProvider.java:60` |
| `WEB_PORT/NEXT_PUBLIC_API_URL` | `3000 / http://localhost:8080` | `web/Dockerfile` `ARG` build-time + `docker-compose.yaml` `web` (browser → server via `localhost:8080`) |
| `PGADMIN_DEFAULT_EMAIL/PASSWORD/PORT` | `admin@mango.local/admin/5050` | `docker-compose.yaml` `pgadmin` (`profile tools`) |

> `NEXT_PUBLIC_API_URL` é **build-time** (Next). Em Docker prod é `ARG` no `web/Dockerfile:11`; em dev é `env` sobreposto no override. Browser sempre chama `localhost:8080`.

## 🔐 Autenticação e Perfis

Autenticação **stateless via JWT (Bearer)**. Fluxo:

1. `POST /api/auth/register` → cria usuário (`ROLE_USER`, saldo `10000.00`) + carteira vazia.
2. `POST /api/auth/login` → `{ token, type:"Bearer", id, name, email, role }`.
3. Front armazena `token` e envia:
   ```
   Authorization: Bearer <token>
   ```

**Perfis:**

| Perfil | Acesso |
|---|---|
| **Visitante (sem token)** | Apenas `POST /api/auth/register` e `POST /api/auth/login` |
| **USER (`ROLE_USER`)** | `GET /api/stocks/**`, `POST /api/trades/**`, `GET /api/portfolio`, `GET /api/trades/history`, `GET /api/ranking`, `GET /api/events`, `GET /api/admin/**` ❌ |
| **ADMIN (`ROLE_ADMIN`)** | Tudo acima + `GET/POST/PUT/DELETE /api/admin/stocks/**`, `/api/admin/events/**`, `GET /api/admin/users/**` |

JWT: `HS256`, `86400000ms (24h)` em `server/src/main/resources/application.properties:16`, validado em `security/JwtTokenProvider.java:60`.

> Criar ADMIN: cadastre como USER e `UPDATE users SET role='ADMIN' WHERE email='admin@...';`.

## 📚 Referência da API

Base URL: `http://localhost:8080` — contrato machine em `docs/sdd/openapi.yaml` (22 endpoints, validado `swagger-cli`).

### 1. Auth — público

#### `POST /api/auth/register` — **201**
```json
// RegisterRequest
{ "name": "Ana Silva", "email": "ana@email.com", "password": "123456" }
// UserResponse 201
{ "id": 1, "name": "Ana Silva", "email": "ana@email.com", "balance": 10000.00, "role": "USER", "createdAt": "2026-09-14T22:00:00" }
```
Erros: `400` `"Email já cadastrado"` / validação.

#### `POST /api/auth/login` — **200**
```json
// Request
{ "email": "ana@email.com", "password": "123456" }
// JwtResponse
{ "token": "eyJhbGciOiJIUzI1NiJ9...", "type": "Bearer", "id": 1, "name": "Ana Silva", "email": "ana@email.com", "role": "USER" }
```
Erros: `401` credenciais inválidas.

---

### 2. Ações (Stocks) — autenticado

#### `GET /api/stocks` — **200** apenas ativas
#### `GET /api/stocks/all` — **200** todas
#### `GET /api/stocks/{id}` — **200** | `404`
#### `GET /api/events` — **200** `[{id,title,description,impact:LOW|MEDIUM|HIGH,startDate,endDate,createdAt}]`

---

### 3. Trading — autenticado (`Authorization: Bearer <token>`, `userId` via `@AuthenticationPrincipal`)

#### `POST /api/trades/buy` — **200** | `400` saldo/inativa | `404`
```json
// TradeRequest
{ "stockId": 1, "quantity": 10 }
// TransactionResponse
{ "id": 5, "userId": 1, "stockId": 1, "stockSymbol": "MANG3", "stockName": "Mango Tech", "type": "BUY", "quantity": 10, "price": 42.50, "createdAt": "..." }
```
#### `POST /api/trades/sell` — **200** | `400` quantidade | `404`
#### `GET /api/trades/history` — **200** `[...]` `createdAt DESC`

---

### 4. Carteira — autenticado

#### `GET /api/portfolio` — **200**
```json
{
  "portfolioId": 1, "userId": 1, "userName": "Ana Silva", "balance": 9575.00,
  "items": [{ "stockId": 1, "stockSymbol": "MANG3", "stockName": "Mango Tech", "sector": "Tecnologia", "currentPrice": 45.00, "quantity": 10, "averagePrice": 42.50, "totalInvested": 425.00, "currentValue": 450.00, "profitLoss": 25.00, "profitLossPercent": 5.88 }],
  "totalInvested": 425.00, "totalCurrentValue": 450.00, "totalPatrimony": 10025.00, "totalProfitLoss": 25.00
}
```
`totalPatrimony = balance + totalCurrentValue` (ver Regras).

---

### 5. Ranking — autenticado

#### `GET /api/ranking` — **200**
```json
[
  { "position": 1, "userId": 2, "userName": "Bruno", "balance": 8000.00, "stockValue": 3200.00, "totalPatrimony": 11200.00 },
  { "position": 2, "userId": 1, "userName": "Ana Silva", "balance": 9575.00, "stockValue": 450.00, "totalPatrimony": 10025.00 }
]
```

---

### 6. Admin — `ROLE_ADMIN` apenas (`401`/`403` senão)

| Método | Rota | Body | Response |
|---|---|---|---|
| `GET` | `/api/admin/stocks` | — | `200` `[StockResponse]` |
| `GET` | `/api/admin/stocks/{id}` | — | `200` / `404` |
| `POST` | `/api/admin/stocks` | `StockRequest` | `201` / `400` dup |
| `PUT` | `/api/admin/stocks/{id}` | `StockRequest` | `200` |
| `DELETE` | `/api/admin/stocks/{id}` | — | `204` |
| `GET` | `/api/admin/events` | — | `200` |
| `GET` | `/api/admin/events/{id}` | — | `200` / `404` |
| `POST` | `/api/admin/events` | `MarketEventRequest` | `201` |
| `PUT` | `/api/admin/events/{id}` | `MarketEventRequest` | `200` |
| `DELETE` | `/api/admin/events/{id}` | — | `204` |
| `GET` | `/api/admin/users` | — | `200` `[UserResponse]` |
| `GET` | `/api/admin/users/{id}` | — | `200` / `404` |

`StockRequest`:
```json
{ "name": "Mango Tech", "symbol": "MANG3", "description": "Tech fictícia", "sector": "Tecnologia", "currentPrice": 42.50, "volatility": 0.02, "active": true }
```
`symbol` UPPERCASE único; `currentPrice` change → `stock_price_history`.

`MarketEventRequest`:
```json
{ "title": "Crise do setor X", "description": "Texto livre", "impact": "HIGH", "startDate": "2026-09-20T00:00:00", "endDate": "2026-09-27T00:00:00" }
```

---

## 🧩 Modelos de Dados

Entidades em `server/src/main/java/com/mangotrading/mangotrading/entity/`:

- **User**: `id, name, email (unique), password (BCrypt), balance (19,4), role (USER/ADMIN), createdAt, updatedAt`
- **Stock**: `id, name, symbol (unique), description (TEXT), sector, currentPrice (19,4), volatility (5,4), active, createdAt, updatedAt`
- **Portfolio**: `id, user (OneToOne unique), createdAt` — 1:1 com User
- **PortfolioItem**: `id, portfolio (ManyToOne), stock (ManyToOne), quantity, averagePrice (19,4)` — unique `(portfolio_id, stock_id)`
- **Transaction**: `id, user (ManyToOne), stock (ManyToOne), type (BUY/SELL), quantity, price (19,4), createdAt`
- **StockPriceHistory**: `id, stock (ManyToOne), price (19,4), createdAt`
- **MarketEvent**: `id, title, description (TEXT), impact (LOW/MEDIUM/HIGH), startDate, endDate, createdAt`

ER: `User 1:1 Portfolio 1:N PortfolioItem N:1 Stock`; `User 1:N Transaction`; `Stock 1:N {PortfolioItem,Transaction,StockPriceHistory}`. Ver `docs/sdd/03-data-model.md`.

## ⚙️ Regras de Negócio

- **Saldo inicial:** `10000.00` (`User.java:54` + `AuthService.java:20`).
- **Compra:** `stock.active`, `quantity>0`, `balance >= price*qty` → debita saldo, `averagePrice` ponderado `(oldQty*oldAvg + qty*price)/newQty` escala 4 `HALF_UP`, cria/atualiza `PortfolioItem`, grava `BUY` (`TradingService.java:22`).
- **Venda:** exige `PortfolioItem` e `quantity <= possuída` → credita `price*qty`, reduz/remove item, grava `SELL` (`TradingService.java:73`).
- **Carteira:** `totalInvested = Σ avg*qty`, `totalCurrentValue = Σ currentPrice*qty`, `totalPatrimony = balance + totalCurrentValue`, `profitLoss = current - invested`, `profitLossPercent HALF_UP` (`PortfolioService.java:30`).
- **Ranking:** `totalPatrimony DESC` (`RankingService.java:25`).
- **Histórico preço:** `StockPriceHistory` a cada `create/update` quando `currentPrice` muda (`StockService.java:60`).
- **Regra proposta:** impedir `DELETE` de `Stock` com vínculos (`PortfolioItem`/`Transaction`) — oferecer `active=false` (ver `docs/sdd/assets/prototype/LEIA-ME.md:59`).

## ❗ Erros

`server/src/main/java/com/mangotrading/mangotrading/exception/GlobalExceptionHandler.java:1`:

**Negócio (400/404/401):**
```json
{ "timestamp": "2026-09-14T22:00:00", "status": 400, "message": "Saldo insuficiente. Necessário: 500.00, Disponível: 100.00" }
```

**Validação (400):**
```json
{ "timestamp": "...", "status": 400, "errors": { "email": "Email inválido", "password": "Senha deve ter no mínimo 6 caracteres" } }
```

**Não autenticado (401):** `"Acesso não autorizado"` (`JwtAuthenticationEntryPoint`). Códigos: `400` validação/saldo, `401` sem token, `403` `USER` em `/api/admin/**`, `404` não encontrado.

## 💻 Exemplos para o Front

### Next.js — `web/src/services/api/client.ts`
```ts
import axios from "axios";
export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
api.interceptors.request.use(cfg => {
  const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});
```

### Cadastro → Login → Mercado → Compra → Carteira
```ts
await api.post("/api/auth/register", { name:"Ana", email:"ana@email.com", password:"123456" });
const { data } = await api.post("/api/auth/login", { email:"ana@email.com", password:"123456" });
localStorage.setItem("token", data.token);
const stocks = await api.get("/api/stocks");
await api.post("/api/trades/buy", { stockId: 1, quantity: 5 });
const portfolio = await api.get("/api/portfolio");
const ranking = await api.get("/api/ranking");
```

### cURL
```bash
curl -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d '{"email":"ana@email.com","password":"123456"}'
TOKEN=eyJhbG...
curl http://localhost:8080/api/stocks -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:8080/api/trades/buy -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"stockId":1,"quantity":2}'
```

### Tratamento de erros
```ts
try { await api.post("/api/trades/buy", body); }
catch (e:any) {
  if (e.response?.status === 401) location.href = "/login";
  else alert(e.response?.data?.message || JSON.stringify(e.response?.data?.errors));
}
```

## 📂 Estrutura de Pastas

```
mango-trading/
├── AGENTS.md                              # ingestion para agentes IA (spec-kit)
├── .env.example → .env                    # env obrigatório (gitignored)
├── docker-compose.yaml                    # prod: db + server (JRE) + web (bun standalone) + pgadmin
├── docker-compose.override.yaml           # dev: hot-reload (server mvnw + web bun dev)
├── docs/
│   ├── Especificação de requisitos.pdf    # ERS pt-BR (autoritativo)
│   └── sdd/                               # SDD modular em inglês (para IA)
│       ├── README.md ... 10-agent-guide.md
│       ├── openapi.yaml                   # 22 endpoints (contrato)
│       └── assets/prototype/              # read-only: pdf, html, png 25, svg 26, figma-link.md
├── .specify/
│   ├── memory/constitution.md
│   └── templates/{spec,plan,tasks}-template.md
├── specs/
│   ├── 001-mango-trading-mvp/{spec,plan,tasks}.md  # 12 US, MVP já em server
│   └── 002-prototype-to-mvp/{spec,plan,tasks}.md   # 25 telas → Next
├── server/                                # Spring Boot 4.1.1
│   ├── Dockerfile                         # multi-stage 17-jdk→jre
│   ├── pom.xml
│   ├── src/main/java/com/mangotrading/mangotrading/
│   │   ├── {controller,service,repository,entity,dto,security,config,exception}
│   └── src/main/resources/application.properties  # com env override SPRING_*
├── web/                                   # Next 16 + bun
│   ├── Dockerfile                         # multi-stage bun 1.3.6 + standalone
│   ├── package.json
│   ├── next.config.ts                     # output:"standalone"
│   └── src/app/{page.tsx,layout.tsx,(auth),(app),(admin)}
└── readme.md                              # este arquivo
```

## 📄 Documentação SDD e Protótipo

- **SDD:** `docs/sdd/README.md` → `01-overview.md` … `10-agent-guide.md` (prioridade `ERS > SDD > Prototype`). Para agentes: ler `AGENTS.md:5` ordem `.specify/constitution → specs/001/spec → docs/sdd/README → code`.
- **OpenAPI:** `docs/sdd/openapi.yaml` — `npx swagger-cli validate docs/sdd/openapi.yaml`.
- **Protótipo:** `docs/sdd/assets/prototype/` — `pdf/MangoTrading_Prototipo.pdf` (24p), `html/index.html` navegável (`xdg-open ...`), `images/pages/*.png` 25 + `images/icons/*.svg` 26, `figma-link.md` (`https://www.figma.com/design/AYyzDCqYcjkXqJxGQHpaxv` + dev-mode futuro). **Read-only** — clonar, não editar. Guia `LEIA-ME.md` com cobertura RF→telas.
- **Spec-kit:** `specs/001` baseline, `specs/002` próximo (ver `docs/sdd/09-traceability.md` matriz 100%).

## 🧪 Desenvolvimento e Testes

```bash
# env
cp .env.example .env

# docker dev
docker compose up --build
docker compose --profile tools up -d  # + pgAdmin 5050

# docker prod
docker compose -f docker-compose.yaml up --build -d

# sem docker
cd server && ./mvnw test               # H2, sem Postgres
cd web && bun run lint && npx tsc --noEmit
npx swagger-cli validate docs/sdd/openapi.yaml
xdg-open docs/sdd/assets/prototype/html/index.html
```

## 📝 Notas

- `server/src/main/resources/static` vazio — API só JSON.
- `volatility`/`events` são informativos; não alteram preço automaticamente (motor futuro).
- `web/AGENTS.md` é auto-gerado Next (`node_modules/next/.../generate-agent-files.js`) — **não remover**.
- `docs/sdd/assets/prototype/` < 4M total (pdf 3.2M + png/svg).
