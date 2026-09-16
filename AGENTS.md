# AGENTS — Mango Trading

> For automated AI agents (spec-kit compatible). Read before coding.

## Mandatory Ingestion Order
1. `.specify/memory/constitution.md` — principles, stack, governance
2. `specs/001-mango-trading-mvp/spec.md` — 12 US, RF/RNF (approved, server implemented)
3. `docs/sdd/README.md` — SDD index, priority rule `ERS > SDD > Prototype`
4. `docs/sdd/01-overview.md` → `10-agent-guide.md` + `openapi.yaml` (22 endpoints)
5. `specs/002-prototype-to-mvp/spec.md` — next feature (25 png parity)
6. Code: `server/` + `web/` + `docs/sdd/assets/prototype/README.md`

## Where is what

| Need | Path |
|---|---|
| Requirements (pt-BR, authoritative) | `docs/Especificação de requisitos.pdf` |
| Technical design (English, LLM-optimized) | `docs/sdd/{01-10}.md` |
| REST contract (machine) | `docs/sdd/openapi.yaml` |
| Prototype (read-only) | `docs/sdd/assets/prototype/{pdf,html,images/pages,images/icons,figma-link.md}` |
| Spec-kit features | `specs/001-mango-trading-mvp/{spec,plan,tasks}.md`, `specs/002-prototype-to-mvp/{spec,plan,tasks}.md` |
| Server | `server/src/main/java/com/mangotrading/mangotrading/{controller,service,repository,entity,dto,security,config}` |
| Web (Next 16) | `web/src/app/*` (skeleton, target per `docs/sdd/07-frontend.md`) |

## Key Constraints (from constitution)

- Fictitious market only; `M$` virtual prefix.
- Decoupled `web (3000) ↔ server (8080) ↔ PG 5432`; JWT HS256 24h `Bearer`.
- `ROLE_USER` vs `ROLE_ADMIN` via `SecurityConfig.java:68`. Server is authority — never rely on UI hiding.
- `balance=10000.00` on register; `symbol` UPPERCASE unique 3-10; `averagePrice` weighted `HALF_UP` scale 4; `patrimony=balance+Σ currentPrice*qty`.
- `docs/sdd/assets/prototype/` is **read-only** — clone, don't edit. Full set in `pdf/html/png 25/svg 26` (<4M).

## Quick Commands

```bash
# env (required)
cp .env.example .env   # then edit secrets

# docker — dev (hot-reload, override)
docker compose up --build                # web:3000 + server:8080 + db:5432
docker compose --profile tools up -d     # + pgAdmin :5050

# docker — prod (no override)
docker compose -f docker-compose.yaml up --build -d

# backend (without docker)
cd server && ./mvnw test               # H2, must be green
# frontend (without docker)
cd web && bun run lint && npx tsc --noEmit
# openapi
npx swagger-cli validate docs/sdd/openapi.yaml
# prototype
xdg-open docs/sdd/assets/prototype/html/index.html
```

## Frontend Warning

`web/AGENTS.md` contains Next.js auto-generated rules (`node_modules/next/dist/server/lib/generate-agent-files.js`). **Do not remove** that block — preserve it and keep `web/src/app` as App Router.

## For the next task

- Implementing `001` verification? Follow `specs/001/tasks.md` Phase 2.
- Implementing `002` frontend? Follow `specs/002/tasks.md` Phases 1-6 + `docs/sdd/07-frontend.md` route map `00→24` screens.
- Update `docs/sdd/09-traceability.md` in same PR as code.
