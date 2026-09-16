# Feature Spec: 002 Prototype to MVP Frontend

> Source: `docs/sdd/assets/prototype/` (Figma `AYyzDCqYcjkXqJxGQHpaxv` + `mango-trading.html` + `MangoTrading_Prototipo.pdf` + 25 png + 26 svg) + `docs/sdd/07-frontend.md` | Status: Draft | Language: English

## Overview
Implement the `web/` frontend so it visually and functionally matches the provided prototype while strictly consuming the existing `server/` REST API (`specs/001` contract). Prototype is **visual contract**; `server/` remains authority for business rules, auth, and persistence. Data shown in prototype (`M$ 4200` balance, `80 AURA3` etc.) is placeholder; real data comes from `GET /api/portfolio`, `GET /api/stocks`, etc.

## User Stories

### US1: Auth — Login & Register
**As a** visitor **I want** login/register screens matching `01-login.png` / `02-cadastro-usuario.png` **so that** I can access the app.
- `Given` `GET /login` `When` rendered `Then` matches `01-login.png`: hero `Aprenda. Negocie. Evolua.` left, form right, fields `E-mail`+`Senha`, CTA `Entrar →`, link to register, demo admin button.
- `Given` register `When` submit invalid `Then` inline errors (matching HTML prototype validation) `aria-describedby`.
- `When` submit valid `Then` `POST /api/auth/register|login`, store `token`, redirect to `/`.

### US2: Navigation — Player vs Admin
**As a** user/admin **I want** distinct navigation matching `11-admin-listagem.png` vs `03-visao-geral.png` **so that** I see only my role.
- `Given` `ROLE_USER` `Then` sidebar: `Visão geral, Mercado, Minha carteira, Histórico, Ranking`; mobile bottom bar same.
- `Given` `ROLE_ADMIN` `Then` sidebar: `Ações e empresas, Eventos de mercado, Usuários` + `← Área do jogador` link.
- `Given` `ROLE_USER` `When` navigating to `/admin/*` `Then` `403` UI + redirect.

### US3: Dashboard — Overview
**As a** player **I want** overview matching `03-visao-geral.png` **so that** I see patrimony at a glance.
- `Given` authenticated `When` `GET /` `Then` cards `Patrimônio total`, `Saldo disponível`, `Valor das ações`, 7-day chart, `Seu lugar 4º` ranking teaser, CTA `Explorar mercado`. Data from `GET /api/portfolio` + `GET /api/ranking`.

### US4: Market — List, Search, Sector Filter
**As a** player **I want** market matching `04-mercado.png` + `23-mobile-mercado.png`
- `When` `GET /market` `Then` table desktop `EMPRESA / SÍMBOLO | PREÇO ATUAL | VARIAÇÃO | AÇÃO` + mobile cards; filters `Buscar empresa ou símbolo` + `Setor` dropdown; data `GET /api/stocks` (active only). Variation (+2.44% etc.) is display; source `volatility`/`currentPrice`.

### US5: Trade — Buy/Sell + Validation
**As a** player **I want** buy/sell modals matching `05-compra.png` / `06-venda.png` / `18-saldo-insuficiente.png` / `24-mobile-compra.png`
- `When` `POST /api/trades/buy|sell` `Then` success `07-compra-concluida.png` or error `Saldo insuficiente. Reduza a quantidade.` (`alert error`). Quantity integer `>0`; buy checks `balance`, sell checks `owned qty`; `stock.active` check.
- `Then` totals: `Total = price*qty`, `Saldo após = balance ± total` live.

### US6: Portfolio — Positions
**As a** player **I want** wallet matching `08-carteira.png` / `19-carteira-vazia.png`
- `When` `GET /wallet` `Then` cards `Patrimônio`, `Saldo`, `Valor das ações`; table `ATIVO | QTD | PREÇO MÉDIO | ATUAL | VALOR ATUAL | RESULTADO | Vender`. Empty state `Sua primeira ação espera por você` + CTA market. Data `GET /api/portfolio`.

### US7: History & Ranking
- History `09-historico.png`: `GET /api/trades/history` table `DATA E HORA | OPERAÇÃO | ATIVO | QTD | PREÇO | TOTAL` + filter `Todas/Compra/Venda`.
- Ranking `10-ranking.png`: `GET /api/ranking` table `POSIÇÃO | JOGADOR | PATRIMÔNIO` + current user highlight.

### US8: Admin — Stocks CRUD
**As an** admin **I want** `11-admin-listagem.png` … `14-admin-exclusao.png`
- List: table `EMPRESA / SÍMBOLO | PREÇO | STATUS | AÇÕES` + badges `Ativa/Desativada` (`active` bool).
- Create `12`: form `Nome, Símbolo, Setor, Preço, Volatilidade, Situação, Descrição` → `POST /api/admin/stocks`.
- Edit `13`: prefilled → `PUT /api/admin/stocks/{id}`.
- Delete `14`: confirm dialog `Excluir X?` → `DELETE`; if linked data then show `vinculos → use Desativar` (proposed rule).

### US9: Admin — Events & Users
- Events `15-eventos.png` + form `16-evento-formulario.png`: list `GET /api/events`, CRUD via `POST/PUT/DELETE /api/admin/events`.
- Users `17-usuarios.png`: `GET /api/admin/users`.

### US10: A11y & Responsive (RNF07/RNF08)
- Matches `21-acessibilidade.png` + `20-guia.png`: contrast AA, focus `outline 3px #a95700`, labels persistent, `aria-describedby`, `header/nav/main/section/table/form`, skip link `Pular para o conteúdo`, no horizontal scroll on `23/24-mobile-*`.

### US11: Coverage Map
- Ensure `22-mapa-requisitos.png` coverage still holds after implementation (see traceability extension).

## Out of Scope
- Price engine automation from volatility/events (informational).
- Real Figma interactivity (prototype `html` is reference only).
- Changing `server/` contract except proposed no-delete guard.

## Dependencies
- `specs/001` + `docs/sdd/openapi.yaml` must be stable.
- Figma links: prototype `https://www.figma.com/design/AYyzDCqYcjkXqJxGQHpaxv` + dev-mode (user to provide dev-mode link).

## Success Criteria
- `web` routes 1:1 with 24 png screens (including `00-capa.svg` as landing); `bun run lint` green; axe 0 critical; `mango-trading.html` flows reproducible via API (buy reduces balance, portfolio updates).

## Open Questions
- [ ] Figma dev-mode link to add?
- [ ] Confirm color tokens: `--ink #172e27, --green #174f3d, --orange #f5ac45, --bg #f5f7f3` from `mango-trading.html:5` as Tailwind `theme`?
- [ ] Use `M$` prefix from prototype or `R$`?
