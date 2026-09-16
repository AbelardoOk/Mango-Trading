# 10 — Agent Guide

> Audience: automated AI coding agents (spec-kit) | Goal: implement without human prompts beyond specs/SDD

## 10.1 Mandatory Reading Order
```
.constitution → specs/<id>/spec.md → specs/<id>/plan.md → docs/sdd/README → docs/sdd/01..09 → code
```
Do not code before reading. For UI work, also read `docs/sdd/assets/prototype/LEIA-ME.md` + view `png`/`html`.

## 10.2 Where to Look

| Need | File |
|---|---|
| What to build | `specs/001/spec.md` US1-12, then `specs/002/spec.md` US1-11 |
| How (design) | `docs/sdd/02-architecture.md`, `03-data-model.md`, `04-api-contracts.md`+`openapi.yaml`, `05-business-rules.md`, `06-security.md`, `07-frontend.md` |
| Visual | `docs/sdd/assets/prototype/images/pages/*.png` (25), `svg` (26), `html/index.html`, `pdf/MangoTrading_Prototipo.pdf` |
| How to verify | `docs/sdd/08-testing-quality.md`, `09-traceability.md` |
| How to task | `specs/<id>/tasks.md` checklist |

## 10.3 Rules

1. **Read-only assets:** `docs/sdd/assets/prototype/` — never edit. Clone visuals into `web/src/components`, not raw HTML import.
2. **No RF invention:** If ERS `12 RFs` not mention it, don't add. Out-of-scope explicitly: real money, auto price engine.
3. **RB09 proposed rule:** If asked to delete `Stock` with links (`PortfolioItem`/`Transaction`), block `400` and suggest `active=false`. Validate with team before coding.
4. **Server is authority:** UI hiding ≠ security. `SecurityConfig:68` is source of truth.
5. **Language:** Code/docstrings English; keep `ERS.pdf` pt-BR untouched. SDD/specs English.
6. **API drift:** If `openapi.yaml` and `controller/*.java` diverge, fix `openapi.yaml` to match controller (22 endpoints). Frontend `types/api.ts` from `openapi.yaml`.
7. **Commit style:** `feat(001): ...` or `feat(002): ...` + update `09-traceability.md` in same PR.
8. **Tokens:** `NEXT_PUBLIC_API_URL=http://localhost:8080`, JWT `Bearer` via `localStorage.token` (prototype style) or httpOnly cookie (decide, document).

## 10.4 Quick Start for Next Task

**Backend example (fix bug):**
```bash
cat docs/sdd/05-business-rules.md#RB02
read server/src/main/java/.../service/TradingService.java:22
./mvnw test -Dtest=TradingServiceTest
```

**Frontend example (002 T012 market):**
```bash
cat specs/002/spec.md#US4
cat docs/sdd/07-frontend.md#7.3  # 04-mercado.png -> /market
cat docs/sdd/openapi.yaml # GET /api/stocks
# view png
xdg-open docs/sdd/assets/prototype/images/pages/04-mercado.png
# code web/src/app/(app)/market/page.tsx
bun run lint && npx tsc --noEmit
```

## 10.5 Validation Checklist (before marking task done)

- [ ] `specs/<id>/tasks.md` checkbox ticked
- [ ] `docs/sdd/09-traceability.md` updated (RF col)
- [ ] `openapi.yaml` still validates (`npx swagger-cli validate docs/sdd/openapi.yaml` or `yq`)
- [ ] `server: ./mvnw test` green (if touched `server/`)
- [ ] `web: bun run lint` green (if touched `web/`)
- [ ] No `assets/prototype/` edited

## 10.6 Figma Placeholders

User will provide: prototype Figma link `https://www.figma.com/design/AYyzDCqYcjkXqJxGQHpaxv` + dev-mode link (to add to `docs/sdd/assets/prototype/figma-link.md`). Starter plan limited calls; full set is in local `pdf/html/png/svg` (less than 4MB).

## 10.7 Troubleshooting

| Symptom | Fix |
|---|---|
| `401` on `/api/stocks` | Check `SecurityConfig` + token header |
| `400 invalid symbol` | Uppercase, 3-10 alphanum |
| Balance mismatch | Check `averagePrice HALF_UP scale4`, not prototype `M$4200` placeholder |
| Mobile nav missing | `@media(max-width:800px)` `mobilebar` vs `side` |

## 10.8 Handoff

After `001` tasks done → start `002` per `specs/002/plan.md` route map. Keep `docker-compose.yaml` placeholder for future.
