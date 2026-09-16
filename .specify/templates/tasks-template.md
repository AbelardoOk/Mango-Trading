# Tasks: [ID] [TITLE]

> Template: spec-kit `tasks-template.md` | Checklist for agents | Mark `[x]` when done

## How to use
1. Read `constitution.md` → `spec.md` → `plan.md` → `docs/sdd/`.
2. Never edit `docs/sdd/assets/prototype/` (read-only).
3. Update `docs/sdd/09-traceability.md` when completing a task.

## Phase 1 — Setup
- [ ] T001 ...
- [ ] T002 ...

## Phase 2 — Backend
- [ ] T010 ...
- [ ] T011 ...

## Phase 3 — Frontend
- [ ] T020 ...

## Phase 4 — Tests & Quality
- [ ] T030 `server: ./mvnw test`
- [ ] T031 `web: bun run lint` + axe
- [ ] T032 Validate `docs/sdd/openapi.yaml`

## Phase 5 — Docs & Traceability
- [ ] T040 Update `09-traceability.md`
- [ ] T041 Update `AGENTS.md` if needed

## Done Criteria
- [ ] All RFs mapped → code → tests
- [ ] `openapi.yaml` matches implementation
- [ ] `09-traceability.md` 100%
