# Software Design Document (SDD) — Mango Trading

> **For automated AI agents** (spec-kit compatible) | Language: English | Version: 1.0 — 2026-09-16
> Source: `docs/Especificação de requisitos.pdf` (pt-BR, authoritative) | Code: `server/` + `web/` | Prototype: `docs/sdd/assets/prototype/`

## Purpose
This SDD translates the Requirements Specification (ERS) into an executable design. It is optimized for LLM ingestion: each file is self-contained, cross-linked, and traceable `RF → SDD → Code`.

## Priority Rule
```
ERS (pdf) > SDD (this folder) > Prototype (assets/prototype)
```
Conflicts resolved by this priority. `prototype` is visual contract (read-only). Never invent RFs.

## Ingestion Order for Agents

| Order | File | What it answers |
|---|---|---|
| 0 | `.specify/memory/constitution.md` | Project principles, stack, governance |
| 1 | `specs/001-mango-trading-mvp/spec.md` | What to build (12 US, RF/RNF) |
| 2 | `docs/sdd/01-overview.md` | Why + definitions |
| 3 | `docs/sdd/02-architecture.md` | How it fits (decoupled, layers) |
| 4 | `docs/sdd/03-data-model.md` | Entities, ER, constraints |
| 5 | `docs/sdd/04-api-contracts.md` + `openapi.yaml` | REST contract (22 endpoints) |
| 6 | `docs/sdd/05-business-rules.md` | Business logic (buy/sell/portfolio/ranking) |
| 7 | `docs/sdd/06-security.md` | Auth, RBAC, JWT |
| 8 | `docs/sdd/07-frontend.md` | Next.js routes + prototype screens |
| 9 | `docs/sdd/08-testing-quality.md` | Verification |
| 10 | `docs/sdd/09-traceability.md` | Matrix RF→SDD→Code |
| 11 | `docs/sdd/10-agent-guide.md` | How to work autonomously |
| 12 | `docs/sdd/11-realtime.md` | SSE realtime (stocks/events) |
| 13 | `specs/002-prototype-to-mvp/spec.md` | Next feature (prototype parity) |

Agents **must** read in order. Do not edit `assets/prototype/` — clone only.

## File Map
```
docs/sdd/
├── README.md (this index)
├── 01-overview.md
├── 02-architecture.md
├── 03-data-model.md
├── 04-api-contracts.md
├── openapi.yaml               # machine-readable contract (26 endpoints incl. stream)
├── 05-business-rules.md
├── 06-security.md
├── 07-frontend.md             # references assets/prototype/
├── 08-testing-quality.md
├── 09-traceability.md
├── 10-agent-guide.md
├── 11-realtime.md             # SSE push (stocks/events)
└── assets/prototype/
    ├── README.md
    ├── figma-link.md
    ├── LEIA-ME.md
    ├── pdf/MangoTrading_Prototipo.pdf
    ├── html/index.html
    ├── images/pages/*.png  (25 screens)
    └── images/icons/*.svg  (26 vectors)
```

## Quick Context

| Layer | Tech | Path | Port |
|---|---|---|---|
| Backend | Java 17, Spring Boot 4.1.1, JPA, Security+jwt 0.12.6 | `server/` | `8080` |
| Frontend | Next 16, React 19, TS 5, Tailwind 4 | `web/` | `3000` |
| DB | PostgreSQL 14, H2 tests | `localhost:5432/mango_trading` | — |

## Verification
- `openapi.yaml` must match `controller/*.java` (grep validated).
- `09-traceability.md` must be 100% for `RF01-12`, `RNF01-09`.
- Assets links valid: `pdf` 3.2M, `html` interactive, `png` 25 + `svg` 26.

## Related
- `specs/001-mango-trading-mvp/plan.md` — pointer from spec-kit to this SDD.
- `specs/002-prototype-to-mvp/plan.md` — next feature using this SDD + prototype.
