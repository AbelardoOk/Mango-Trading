# 📈 Mango Trading — Simulador de Mercado Financeiro

Simulador de trading com ações fictícias. Usuários operam com **saldo virtual** (sem dinheiro real), gerenciam carteira, visualizam histórico e competem em ranking por patrimônio total.

> ⚠️ Empresas, ações, preços e eventos são fictícios. Arquitetura **desacoplada**: `server` é API REST pura; front-end consome via HTTP/JSON em projeto separado.

## 🧭 Sumário
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Como rodar](#-como-rodar)
- [Autenticação e Perfis](#-autenticação-e-perfis)
- [Referência da API](#-referência-da-api)
- [Modelos de Dados](#-modelos-de-dados)
- [Regras de Negócio](#-regras-de-negócio)
- [Erros](#-erros)
- [Exemplos para o Front](#-exemplos-para-o-front)
- [Estrutura de Pastas](#-estrutura-de-pastas)

## 🏗️ Arquitetura

```
Front-end (React + TS + Vite)  ──HTTP/JSON──►  Back-end (Spring Boot)  ──►  PostgreSQL
   localhost:5173 (Vite)                    localhost:8080 (API)              localhost:5432/mango_trading
```

Back-end em camadas: `controller → service → repository → entity` + `dto` + `config/security` + `exception`.

CORS liberado para `http://localhost:5173` e `http://localhost:3000` em `server/src/main/java/com/mangotrading/mangotrading/config/SecurityConfig.java:68`.

## 🛠️ Tecnologias

**Back-end:** Java 17, Spring Boot 4.1.1, Spring WebMVC, Spring Data JPA, Spring Security + JWT (jjwt 0.12.6), Hibernate, PostgreSQL, Maven, Lombok. Testes com `spring-boot-starter-test` + H2.

**Front-end (projeto separado):** React, TypeScript, Vite — consome a API abaixo.

## 🚀 Como rodar

### Pré-requisitos
- Java 17+, Maven 3.9+, PostgreSQL 14+

### Banco
```sql
CREATE DATABASE mango_trading;
-- usuário/senha padrão esperados: postgres/postgres (ajuste em application.properties)
```

### Back-end (API)
```bash
cd server
# configure src/main/resources/application.properties se necessário
# spring.datasource.url=jdbc:postgresql://localhost:5432/mango_trading
# jwt.secret e jwt.expiration-ms já vêm com default (24h)
./mvnw spring-boot:run
# API em http://localhost:8080
```

Testes (usa H2 em memória, não precisa Postgres):
```bash
cd server
./mvnw test
```

### Front-end (desacoplado)
Projeto **separado** — exemplo de consumo:
```bash
# em outro repositório/pasta
npm create vite@latest mango-front -- --template react-ts
cd mango-front && npm install && npm run dev # http://localhost:5173
```

Variável recomendada no front:
```env
VITE_API_URL=http://localhost:8080
```

## 🔐 Autenticação e Perfis

Autenticação **stateless via JWT (Bearer)**. Fluxo:

1. `POST /api/auth/register` → cria usuário (`ROLE_USER`, saldo inicial `10000.00`) e carteira vazia.
2. `POST /api/auth/login` → retorna `{ token, type:"Bearer", id, name, email, role }`.
3. Front armazena `token` e envia em toda requisição autenticada:
   ```
   Authorization: Bearer <token>
   ```

**Perfis:**

| Perfil | Acesso |
|---|---|
| **Visitante (sem token)** | Apenas `POST /api/auth/register` e `POST /api/auth/login` |
| **USER (`ROLE_USER`)** | `GET /api/stocks/**`, `POST /api/trades/**`, `GET /api/portfolio`, `GET /api/trades/history`, `GET /api/ranking`, `GET /api/events`, `GET /api/admin/**` ❌ |
| **ADMIN (`ROLE_ADMIN`)** | Tudo acima + `GET/POST/PUT/DELETE /api/admin/stocks/**`, `/api/admin/events/**`, `GET /api/admin/users/**` |

JWT: `HS256`, expiração `86400000ms (24h)` em `server/src/main/resources/application.properties:10`, validado em `server/src/main/java/com/mangotrading/mangotrading/security/JwtTokenProvider.java:60`.

> Para criar um ADMIN, cadastre como USER e altere no banco: `UPDATE users SET role='ADMIN' WHERE email='admin@...';` (ou via seeder futuro).

## 📚 Referência da API

Base URL: `http://localhost:8080`

### 1. Auth — público

#### `POST /api/auth/register`
Cria usuário + carteira. **201 Created**

Request `RegisterRequest`:
```json
{
  "name": "Ana Silva",
  "email": "ana@email.com",
  "password": "123456"
}
```
Response `UserResponse`:
```json
{
  "id": 1,
  "name": "Ana Silva",
  "email": "ana@email.com",
  "balance": 10000.00,
  "role": "USER",
  "createdAt": "2026-09-14T22:00:00"
}
```
Erros: `400` se email já existe (`"Email já cadastrado"`), `400` validação (`name/email/password`).

#### `POST /api/auth/login`
Autentica e retorna JWT. **200 OK**

Request:
```json
{ "email": "ana@email.com", "password": "123456" }
```
Response `JwtResponse`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "id": 1,
  "name": "Ana Silva",
  "email": "ana@email.com",
  "role": "USER"
}
```
Erros: `401` credenciais inválidas.

---

### 2. Ações (Stocks) — autenticado

#### `GET /api/stocks`
Lista **apenas ativas**. **200**
```json
[
  {
    "id": 1,
    "name": "Mango Tech",
    "symbol": "MANG3",
    "description": "Empresa fictícia de tecnologia",
    "sector": "Tecnologia",
    "currentPrice": 42.50,
    "volatility": 0.0250,
    "active": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### `GET /api/stocks/all`
Lista todas (ativas e inativas). **200** — útil para admin no front filtrar.

#### `GET /api/stocks/{id}`
Detalhe por id. **200** | `404` se não existe.

#### `GET /api/events`
Lista eventos de mercado (público para autenticados). **200**
```json
[
  {
    "id": 1,
    "title": "Alta nos juros",
    "description": "Impacta setor bancário",
    "impact": "HIGH",
    "startDate": "2026-09-20T00:00:00",
    "endDate": "2026-09-27T00:00:00",
    "createdAt": "..."
  }
]
```
`impact`: `LOW | MEDIUM | HIGH`.

---

### 3. Trading — autenticado

Header obrigatório: `Authorization: Bearer <token>`. `userId` é inferido do token (`@AuthenticationPrincipal`), não enviado pelo front.

#### `POST /api/trades/buy`
Compra. **200** | `400` saldo insuficiente/ação inativa, `404` ação não encontrada.

Request `TradeRequest`:
```json
{ "stockId": 1, "quantity": 10 }
```
Response `TransactionResponse`:
```json
{
  "id": 5,
  "userId": 1,
  "stockId": 1,
  "stockSymbol": "MANG3",
  "stockName": "Mango Tech",
  "type": "BUY",
  "quantity": 10,
  "price": 42.50,
  "createdAt": "..."
}
```

#### `POST /api/trades/sell`
Venda. **200** | `400` quantidade insuficiente, `404` não possui ação.

Mesmo `TradeRequest`/`TransactionResponse` com `"type":"SELL"`.

#### `GET /api/trades/history`
Histórico do usuário logado, ordenado por `createdAt DESC`. **200**
```json
[ { "id": 5, "type": "BUY", ... }, { "id": 6, "type": "SELL", ... } ]
```

---

### 4. Carteira — autenticado

#### `GET /api/portfolio`
Carteira do usuário logado. **200** | `404` se carteira não existe.

Response `PortfolioResponse`:
```json
{
  "portfolioId": 1,
  "userId": 1,
  "userName": "Ana Silva",
  "balance": 9575.00,
  "items": [
    {
      "id": 1,
      "stockId": 1,
      "stockSymbol": "MANG3",
      "stockName": "Mango Tech",
      "sector": "Tecnologia",
      "currentPrice": 45.00,
      "quantity": 10,
      "averagePrice": 42.50,
      "totalInvested": 425.00,
      "currentValue": 450.00,
      "profitLoss": 25.00,
      "profitLossPercent": 5.88
    }
  ],
  "totalInvested": 425.00,
  "totalCurrentValue": 450.00,
  "totalPatrimony": 10025.00,
  "totalProfitLoss": 25.00
}
```
Cálculos: `totalPatrimony = balance + totalCurrentValue` (ver [Regras](#-regras-de-negócio)).

---

### 5. Ranking — autenticado

#### `GET /api/ranking`
Ranking global por patrimônio total decrescente. **200**
```json
[
  {
    "position": 1,
    "userId": 2,
    "userName": "Bruno",
    "balance": 8000.00,
    "stockValue": 3200.00,
    "totalPatrimony": 11200.00
  },
  {
    "position": 2,
    "userId": 1,
    "userName": "Ana Silva",
    "balance": 9575.00,
    "stockValue": 450.00,
    "totalPatrimony": 10025.00
  }
]
```

---

### 6. Admin — `ROLE_ADMIN` apenas

Todos exigem `Authorization: Bearer <token de ADMIN>`; caso contrário `401` ou `403`.

#### Stocks CRUD

| Método | Rota | Body | Response |
|---|---|---|---|
| `GET` | `/api/admin/stocks` | — | `200` `[StockResponse]` |
| `GET` | `/api/admin/stocks/{id}` | — | `200` `StockResponse` / `404` |
| `POST` | `/api/admin/stocks` | `StockRequest` | `201` `StockResponse` / `400` símbolo duplicado |
| `PUT` | `/api/admin/stocks/{id}` | `StockRequest` | `200` `StockResponse` |
| `DELETE` | `/api/admin/stocks/{id}` | — | `204` |

`StockRequest`:
```json
{
  "name": "Mango Tech",
  "symbol": "MANG3",
  "description": "Tech fictícia",
  "sector": "Tecnologia",
  "currentPrice": 42.50,
  "volatility": 0.02,
  "active": true
}
```
`symbol` é normalizado para `UPPERCASE` e único. Alteração de `currentPrice` gera registro em `stock_price_history` (histórico).

#### Market Events CRUD

| Método | Rota | Body | Response |
|---|---|---|---|
| `GET` | `/api/admin/events` | — | `200` `[MarketEventResponse]` |
| `GET` | `/api/admin/events/{id}` | — | `200` / `404` |
| `POST` | `/api/admin/events` | `MarketEventRequest` | `201` |
| `PUT` | `/api/admin/events/{id}` | `MarketEventRequest` | `200` |
| `DELETE` | `/api/admin/events/{id}` | — | `204` |

`MarketEventRequest`:
```json
{
  "title": "Crise do setor X",
  "description": "Texto livre",
  "impact": "HIGH",
  "startDate": "2026-09-20T00:00:00",
  "endDate": "2026-09-27T00:00:00"
}
```

#### Users (leitura)

| Método | Rota | Response |
|---|---|---|
| `GET` | `/api/admin/users` | `200` `[UserResponse]` |
| `GET` | `/api/admin/users/{id}` | `200` `UserResponse` / `404` |

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

## ⚙️ Regras de Negócio

- **Saldo inicial:** `10000.00` ao registrar (`User.java:54` + `AuthService.java:20`).
- **Compra:** valida `stock.active`, `quantity>0`, `balance >= currentPrice*quantity` → debita saldo, calcula `averagePrice` ponderado `(oldQty*oldAvg + qty*price)/newQty` (escala 4), cria/atualiza `PortfolioItem`, grava `Transaction BUY` (`TradingService.java:22`).
- **Venda:** exige `PortfolioItem` existente e `quantity <= possuída` → credita saldo `price*quantity`, reduz ou remove item (se zerou), grava `SELL` (`TradingService.java:73`).
- **Carteira:** `totalInvested = Σ averagePrice*qty`, `totalCurrentValue = Σ currentPrice*qty`, `totalPatrimony = balance + totalCurrentValue`, `profitLoss = current - invested`, `profitLossPercent` com `HALF_UP` (`PortfolioService.java:30`).
- **Ranking:** ordena todos usuários por `totalPatrimony DESC` (`RankingService.java:25`).
- **Histórico de preço:** gravado a cada `create/update` de `Stock` quando `currentPrice` muda (`StockService.java:60`).

## ❗ Erros

Padronizados por `server/src/main/java/com/mangotrading/mangotrading/exception/GlobalExceptionHandler.java:1`:

**Sucesso com erro de negócio (400/404/401):**
```json
{
  "timestamp": "2026-09-14T22:00:00",
  "status": 400,
  "message": "Saldo insuficiente. Necessário: 500.00, Disponível: 100.00"
}
```

**Validação (400):**
```json
{
  "timestamp": "...",
  "status": 400,
  "errors": { "email": "Email inválido", "password": "Senha deve ter no mínimo 6 caracteres" }
}
```

**Não autenticado (401):** texto `"Acesso não autorizado"` via `JwtAuthenticationEntryPoint`.

Códigos: `400` validação/saldo/quantidade, `401` sem token/expirado, `403` USER tentando `/api/admin/**`, `404` recurso não encontrado.

## 💻 Exemplos para o Front

### Axios (Vite) — `src/api/client.ts`
```ts
import axios from "axios";
export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
```

### Cadastro → Login → Listar ações → Comprar → Carteira
```ts
// cadastro
await api.post("/api/auth/register", { name:"Ana", email:"ana@email.com", password:"123456" });
// login
const { data } = await api.post("/api/auth/login", { email:"ana@email.com", password:"123456" });
localStorage.setItem("token", data.token);
// ações
const stocks = await api.get("/api/stocks"); // 401 se sem token
// comprar 5 unidades da ação 1
await api.post("/api/trades/buy", { stockId: 1, quantity: 5 });
// carteira
const portfolio = await api.get("/api/portfolio");
// ranking
const ranking = await api.get("/api/ranking");
```

### cURL
```bash
# login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ana@email.com","password":"123456"}'

# usar token
TOKEN=eyJhbGci...
curl http://localhost:8080/api/stocks -H "Authorization: Bearer $TOKEN"
curl http://localhost:8080/api/portfolio -H "Authorization: Bearer $TOKEN"
curl -X POST http://localhost:8080/api/trades/buy \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"stockId":1,"quantity":2}'
```

### Tratamento de erros no front
```ts
try { await api.post("/api/trades/buy", body); }
catch (e:any) {
  if (e.response?.status === 401) navigate("/login");
  else alert(e.response?.data?.message || e.response?.data?.errors);
}
```

## 📂 Estrutura de Pastas

```
mango-trading/
├── readme.md              # este arquivo (documentação da API)
└── server/                # API Spring Boot (desacoplada)
    ├── pom.xml
    ├── src/main/java/com/mangotrading/mangotrading/
    │   ├── MangoTradingApplication.java
    │   ├── config/SecurityConfig.java
    │   ├── security/ (JwtTokenProvider, JwtAuthenticationFilter, UserDetailsImpl)
    │   ├── controller/ (Auth, Stock, Trading, Portfolio, Ranking, Admin*)
    │   ├── service/ (Auth, Stock, Trading, Portfolio, Ranking, MarketEvent, User)
    │   ├── repository/ (7 interfaces JpaRepository)
    │   ├── entity/ (7 entidades + enums Role/TransactionType/MarketImpact)
    │   ├── dto/ (request/response)
    │   └── exception/ (GlobalExceptionHandler)
    └── src/main/resources/application.properties
    └── src/test/resources/application.properties (H2 p/ testes)
```

## 📄 Notas

- Sem front dentro de `server/` — `src/main/resources/static` vazio; API serve apenas JSON.
- Para docs interativas, adicione `springdoc-openapi` futuramente (`/swagger-ui`).
- Volatilidade e eventos são informativos; não alteram preço automaticamente (pode ser estendido).

