# 01 — Overview

> Source: ERS §1 Purpose/Scope, §1.3 Definitions | Code: `server/` + `web/` | Prototype: `assets/prototype/LEIA-ME.md`

## 1.1 Purpose
Specify the Mango Trading fictitious-market simulator for spec-kit agents. This doc translates `docs/Especificação de requisitos.pdf` (pt-BR) into English design. It records scope, definitions, stakeholders, and assumptions for autonomous implementation.

## 1.2 Scope

**What the system does (ERS §1.2):**
- Visitor: register (`RF01`), login (`RF02`)
- Auth & RBAC (`RF03`): `ROLE_USER` vs `ROLE_ADMIN` via Spring Security
- Admin: CRUD stocks (`RF04`) — `name, symbol, description, sector, currentPrice, volatility, active`
- User: view active stocks (`RF05`)
- Trading: buy (`RF06`) / sell (`RF07`) with virtual balance; update balance (`RF08`)
- Portfolio per user (`RF09`), record all transactions (`RF10`), calculate patrimony (`RF11`)
- Ranking by patrimony (`RF12`)
- Market events (admin CRUD, user view) and users listing (admin) — implied by ERS §2.1/§4

**What it does NOT do:**
- No real money, no real stocks. All prices/events fictitious.
- No automated price engine from volatility/events (informational only, see `05-business-rules.md`).
- No OAuth/2FA/email verification (out of MVP).

## 1.3 Definitions

| Term | Definition |
|---|---|
| MVP | Minimum Viable Product: RF01-12 high priority |
| JWT | JSON Web Token, HS256, 24h |
| REST API | HTTP/JSON between `web` and `server` |
| Portfolio | Set of `PortfolioItem` with `quantity, averagePrice` |
| Patrimony | `balance + Σ currentPrice*qty` |
| Ranking | `ORDER BY totalPatrimony DESC` |
| M$ | Prototype virtual currency prefix |

## 1.4 Stakeholders
- **Team:** Abelardo Palácios Ribeiro, Miguel Ribeiro Bernal, Giovana Gomes Pavese (UFMS FACOM)
- **Roles:** Backend (`server/`), Frontend (`web/`), Academic evaluators.

## 1.5 History
| Version | Date | Author | Change |
|---|---|---|---|
| 0.1 | 2026-12-08 | Req Team | IEEE 830 draft |
| 1.0 | 2026-09-14 | Mango Team | Full ERS + use-case diagram |
| 1.1 | 2026-09-14 | Mango Team | Prototype skeleton alignment |
| SDD 1.0 | 2026-09-16 | SDD | English modular SDD + spec-kit + prototype assets |

## 1.6 References
- `docs/Especificação de requisitos.pdf` §§1-5, Apêndices
- `readme.md` (API ref, tech, run instructions)
- `docs/sdd/assets/prototype/LEIA-ME.md` (prototype coverage)
- `.specify/memory/constitution.md` (principles)
