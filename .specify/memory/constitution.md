# Mango Trading — Constitution

> Source: `docs/Especificação de requisitos.pdf` §1-3 + `readme.md` | Effective: 2026-09-16 | Version: 1.0

## 1. Principles
1. **Fictitious market only** — No real money, no real stocks. All companies, symbols, prices, events are synthetic. Enforced at domain and UI copy.
2. **Decoupled architecture** — `server` (Spring Boot REST JSON) and `web` (Next.js) are independent. Communication only via `HTTP/JSON`. No server-side rendering of UI from `server`.
3. **Persistence is real** — PostgreSQL is source of truth (`RNF03`/`RNF04`). `ddl-auto=update` for MVP, migrations later. No in-memory prototype data in production.
4. **Security by server** — JWT `HS256`, `Bearer` stateless, 24h expiry. `Spring Security` is authority. Hiding buttons is not authorization. `ROLE_USER` vs `ROLE_ADMIN`.
5. **Accessibility & Responsiveness are MVP** — WCAG AA (semantic HTML, labels, ARIA, contrast, focus visible), responsive (desktop + mobile bottom nav). `RNF07`/`RNF08`.
6. **Layered maintainability** — `controller → service → repository → entity` + `dto` + `config/security` + `exception` (`RNF09`). No leakage of entities to controllers.
7. **Spec-driven** — ERS > SDD (`docs/sdd/`) > Prototype (`docs/sdd/assets/prototype/`). Conflicts resolved by this priority. `prototype` is visual contract, not executable spec.

## 2. Tech Stack (non-negotiable per ERS/RNF)
- **Backend:** Java 17+, Spring Boot 4.1.1, Spring WebMVC, Spring Data JPA, Spring Security + jjwt 0.12.6, Hibernate, Maven, Lombok, PostgreSQL 14+, H2 for tests.
- **Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind 4, `bun` package manager. Consumes `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`).
- **Infra:** `docker-compose` (planned), `localhost:3000` (web) ↔ `localhost:8080` (server) CORS allow-list.

## 3. Governance
- **Language:** ERS is `pt-BR` (authoritative). SDD and `specs/` are **English** (LLM-optimized). Code comments/docstrings English.
- **File ownership:**
  - `docs/Especificação de requisitos.pdf` — immutable source.
  - `docs/sdd/` — technical design, owned by architecture. Changes require traceability update in `09-traceability.md`.
  - `docs/sdd/assets/prototype/` — **read-only** reference. Never edit; cloning only.
  - `specs/` — spec-kit features. Each `spec.md` must have `User Story + Acceptance Criteria (Given/When/Then)` and link to SDD.
- **Branching:** `specs/<id>-*` → tasks. Agents must read `constitution.md` → `spec.md` → `docs/sdd/README.md` → code before coding.
- **Proposed rule (from prototype LEIA-ME:59):** Prevent deletion of `Stock` with linked `PortfolioItem` or `Transaction`; offer deactivation instead. Must be validated and codified in `StockService`.

## 4. Constraints
- Initial balance `10000.00` at registration (`User.java:54` + `AuthService.java:20`).
- Symbol normalized `UPPERCASE`, unique, 3-10 chars alphanumeric.
- `price` positive, scale 2 for display, scale 4 for computation. `volatility` non-negative.
- `quantity` integer `>0`. `averagePrice` weighted, `HALF_UP`, scale 4.
- `totalPatrimony = balance + Σ currentPrice*qty`. Ranking `ORDER BY totalPatrimony DESC`.

## 5. Quality Gates
- All endpoints documented in `docs/sdd/openapi.yaml` and validated (`swagger-cli` or `springdoc`).
- `server: ./mvnw test` (H2) must pass. No `open-in-view`.
- `web: bun run lint` + `axe` a11y check on prototype-parity pages.
- Traceability `docs/sdd/09-traceability.md` must cover 100% RF01-12 / RNF01-09.
