# 06 — Security

> Source: ERS §2.1, §4, RNF06 | Code: `config/SecurityConfig.java:68`, `security/*`, `entity/enums/Role.java`

## 6.1 Authentication — JWT Stateless

- **Flow:** `POST /api/auth/register` → `POST /api/auth/login` → `JwtResponse.token` → `Authorization: Bearer <token>` on all other calls.
- **Token:** HS256, secret `application.properties:17`, expiry `86400000ms = 24h` (`:18`), provider `security/JwtTokenProvider.java:60` `generateToken`, `validateToken`, `getUserIdFromJWT`.
- **Password:** `BCrypt` via `PasswordEncoder` in `AuthService`.

## 6.2 Authorization — RBAC

| Role | Value | Access |
|---|---|---|
| Visitor | no token | `POST /api/auth/register`, `POST /api/auth/login` only |
| USER | `ROLE_USER` | `GET /api/stocks/**`, `POST /api/trades/**`, `GET /api/portfolio`, `GET /api/trades/history`, `GET /api/ranking`, `GET /api/events` |
| ADMIN | `ROLE_ADMIN` | Above + `GET/POST/PUT/DELETE /api/admin/stocks/**`, `/api/admin/events/**`, `GET /api/admin/users/**` |

Enforced in `SecurityConfig.java:68` — `authorizeHttpRequests`:
```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers("/api/admin/**").hasRole("ADMIN")
.anyRequest().authenticated()
```
Plus `JwtAuthenticationFilter` (extract token, load `UserDetailsImpl` via `CustomUserDetailsService`, set `SecurityContext`), and `JwtAuthenticationEntryPoint` (`401 "Acesso não autorizado"`).

## 6.3 Frontend Handling
- Store `token` in `localStorage` (prototype style). `services/api/client.ts` interceptor adds `Authorization`. On `401` redirect to `/login`; on `403` show forbidden UI (admin guard).
- **Never trust UI hiding:** server is authority. Admin guard in `web/middleware.ts` is UX only.

## 6.4 CORS
`SecurityConfig.java:68` `cors.configuration` allows `http://localhost:3000`, `http://localhost:5173` (Vite), methods `GET/POST/PUT/DELETE`, headers `*`.

## 6.5 User Management
- Default role `USER` on register. To create ADMIN: `UPDATE users SET role='ADMIN' WHERE email='admin@...'` or future seeder. No public promotion endpoint.
- `ADMIN` can `GET /api/admin/users` (read-only).

## 6.6 Error Mapping
- `401` missing/expired token (`JwtAuthenticationEntryPoint`)
- `403` `ROLE_USER` hitting `/api/admin/**`
- `400/404` business errors via `GlobalExceptionHandler`.

## 6.7 Future
- Secret rotation, refresh tokens, rate limiting not in MVP.
