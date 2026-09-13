# MEMBER 1 FINAL AUDIT REPORT

**Kết quả bàn giao:** đã hoàn tất sửa lỗi Member 1 trong Backend; lint/typecheck/build,
83 unit test, 47 E2E và migration đều PASS. Docker image cuối đã kiểm tra health, đăng ký,
RBAC và các route catalog mới thành công. Dependency runtime không còn high/critical, nhưng
còn 7 cảnh báo moderate; toàn bộ dependency gồm dev còn 8 moderate. Chưa chứng nhận triển khai
production hoặc tích hợp Cloudinary/Web/Mobile thực tế. Xem [MEMBER1-INTEGRATION.md](MEMBER1-INTEGRATION.md) để cấu hình
JWT secrets và chạy migration trước khi khởi động.

Date: 2026-09-09. Task: audit, fix, test and hand over Member 1 Core Platform/Security/Integration.
Repository: Backend-FixHome only. Scope and decisions follow the attached master prompt and
`docs/AI-TECHNICAL-GUIDE.md`. The workspace already contained substantial uncommitted Member 1
implementation; it was reviewed and extended, not discarded or attributed entirely to this audit.

## 1. Final score and scope

**9.8/10 for the Member 1 Capstone backend scope** (engineering assessment, not a coverage metric).
Initial assessment was 5/10. Required functional/build gates pass. This is not a certification of
production deployment, real identity-document storage, or completion of Members 2/3/4.

## 2. Findings and fixes

| Component | Initial audit | Final implementation/evidence |
|---|---|---|
| Authentication/JWT | SECURITY_RISK | Removed default/derived secrets; separate HS256 secrets, expiry validation, minimum payload, DB account/role lookup |
| Refresh persistence/rotation | INCORRECT | Unique jti, SHA-256 hashes, expiry copied from JWT, user-row transaction lock, conditional consume, same-session logout |
| User/account management | PARTIAL | Explicit safe profile mapper, select:false passwordHash, normalized phone, DTO protection, atomic status/session revoke |
| RBAC/CurrentUser | DONE with gaps | One shared implementation; old import paths re-export; Admin-only user/verification management; catalog role matches Docs |
| Ownership | PARTIAL | Own-profile and verification queries bound to authenticated ID; scoped logout; Member 2/3 ownership pattern documented |
| Verification/review | SECURITY_RISK | Transaction includes documents; single pending/approved DB index; pending-only atomic review; reviewer/time; inactive account checks |
| Verification documents | PARTIAL | HTTPS Cloudinary metadata, configured cloud, filename/MIME/size/count validation; actual upload remains outside this API |
| Service categories/services | INCORRECT | Active service AND category; no public bypass/direct-ID inactive reads; decimal/range checks; DB price constraint; soft deletion |
| Shared config/environment | SECURITY_RISK | Fail-fast JWT/DB validation, strict CORS, verified DB TLS, synchronize false, no SQL query logging at runtime |
| Validation/pagination | PARTIAL | Concrete logout/status DTOs, no unsafe body implicit conversion, integer pagination, string bounds, stronger password policy |
| Global error/response | PARTIAL | Safe 5xx and logs, safe unique/check constraint mapping, consistent envelopes and pagination; Swagger reflects envelopes |
| Prefix/Swagger | PARTIAL | Shared bootstrap used by production and E2E; `/api/v1`, `/api/docs`, request DTOs and bearer documentation |
| Health | INCORRECT | Service owns DB query; 503 for unavailable/timeout; 5-second bound; no AI module dependency |
| Migrations/database | PARTIAL | Safe legacy adoption, timezone alignment, integrity migration, guarded rollback, compiled production migration command |
| Logging/rate/CORS/Helmet | PARTIAL/MISSING | No query strings/raw exceptions in shared logs; auth-only throttler; exact origins; Helmet verified over HTTP |
| Unit/integration/E2E | PARTIAL | 83 unit tests + 47 PostgreSQL HTTP/E2E tests; real validation, authorization, constraints, concurrency and rollback |
| Docker/CI | PARTIAL | Clean image install/build, non-root runtime, production migration/registration smoke; CI runtime high/critical audit gate |
| Dependency audit | SECURITY_RISK | bcrypt 6, Vitest/coverage 4.1.11, compatible dependency overrides; zero high/critical; moderate findings remain |

## 3. Files created by this audit

- `src/setup-app.ts`
- `src/shared/validation/input.transforms.ts`
- `src/shared/dto/update-active-status.dto.ts`
- `src/modules/auth/dto/logout.dto.ts`
- `src/modules/health/health.service.spec.ts`
- `src/database/migrations/1725890000000-CoreIntegrity.ts`
- `docs/MEMBER1-INTEGRATION.md`
- `docs/MEMBER1-FINAL-AUDIT.md`

## 4. Files modified

- Configuration/operation: `.env.example`, `.dockerignore`, `Dockerfile`, `docker-compose.yml`,
  `package.json`, `package-lock.json`, `.github/workflows/ci.yml`, `src/main.ts`.
- Shared/database: env validator/tests; exception filter; logging interceptor; pagination;
  BaseEntity, DatabaseModule, CLI DataSource; the two existing baseline migrations.
- Auth: controller/module/service, JWT strategy, register/login/refresh/profile DTOs, service tests.
- Users: service, user/admin controllers, profile/query DTOs, entity, service tests.
- Categories/services: public/admin controllers, services, input/query DTOs and entities.
- Verification: service, document/review DTOs, verification entity, service tests.
- Health: controller/module/service; `test/app.e2e-spec.ts` expanded from two health checks.
- Existing changed Member 1 TypeScript files were formatted. No Member 2/3/4 business file was edited.
  The final `git status` also contains earlier user changes and previously untracked Member 1 files.

## 5–6. Database changes and migrations

No new duplicate verification state on users. Existing `status` and compatible `isActive` remain.
Entities use timestamptz as documented. Duplicate unique declarations were removed from catalog/user
entities; canonical unique indexes enforce identifiers.

Three migrations run successfully on a fresh PostgreSQL 16 database. E2E also proves full rollback
for newly created tables, reapplication, preservation of a legacy inactive User and its password
hash/timestamp, and refusal to drop adopted user tables. CoreIntegrity adds a single-open-verification
unique index and price check constraint, normalizes identifiers, and revokes ambiguous old sessions.
The original baseline corrections are additive for new/adopted installations; existing migration
history is not rewritten. See the integration guide for rollback/data-conflict/UTC limitations.

## 7. Final APIs

All feature paths below have `/api/v1`; health/docs exceptions are shown in full.

| Method | Endpoint | Actor | Auth | Role | Purpose |
|---|---|---|---|---|---|
| POST | `/auth/register` | Public | No | Customer/Technician only | Register and issue session |
| POST | `/auth/login` | Public | No | Any active account | Login using identifier or email alias |
| POST | `/auth/refresh` | Session holder | Refresh token | Active account | Rotate session tokens |
| POST | `/auth/logout` | Account owner | JWT | Any | Revoke owned session/all own sessions |
| GET | `/auth/me` | Account owner | JWT | Any active account | Safe profile |
| GET/PATCH | `/users/me` | Account owner | JWT | Any active account | Read/update permitted profile fields |
| GET | `/admin/users` | Admin | JWT | Admin | Paginated/filterable safe profiles |
| GET | `/admin/users/:id` | Admin | JWT | Admin | Safe user detail |
| PATCH | `/admin/users/:id/status` | Admin | JWT | Admin | Status change and session revocation |
| GET | `/service-categories`, `/:id` | Public | No | Any | Active categories and active child services |
| GET | `/services`, `/:id` | Public | No | Any | Active catalog within active categories |
| GET/POST | `/admin/service-categories` | Catalog manager | JWT | Admin/Service Manager | List all/create category |
| PATCH/DELETE | `/admin/service-categories/:id` | Catalog manager | JWT | Admin/Service Manager | Update/deactivate category |
| PATCH | `/admin/service-categories/:id/status` | Catalog manager | JWT | Admin/Service Manager | Set isActive |
| GET/POST | `/admin/services` | Catalog manager | JWT | Admin/Service Manager | List all/create service |
| GET/PATCH/DELETE | `/admin/services/:id` | Catalog manager | JWT | Admin/Service Manager | Detail/update/deactivate service |
| PATCH | `/admin/services/:id/status` | Catalog manager | JWT | Admin/Service Manager | Set isActive |
| POST/GET | `/technicians/me/verification` | Technician owner | JWT | Technician | Submit/get own verification (alias: `/technician/verification`) |
| GET | `/admin/technician-verifications`, `/:id` | Admin | JWT | Admin | List/read verification |
| PATCH | `/admin/technician-verifications/:id/approve` | Admin | JWT | Admin | Review pending request |
| PATCH | `/admin/technician-verifications/:id/reject` | Admin | JWT | Admin | Reject with required reason |
| GET | `/health`, `/api/v1/health` | Monitoring | No | Any | Backend/database readiness |
| GET | `/api/docs`, `/api/docs-json` | API consumer | No | Any | Swagger/OpenAPI |

Category aliases `/categories` and `/admin/categories` preserve the canonical Docs catalog paths.
DELETE is deactivation; no catalog row is hard-deleted.

## 8. Security and dependencies

Passwords use bcrypt, are limited to 72 UTF-8 bytes at registration, and never enter tokens/profiles.
JWT secrets have no insecure fallback. Refresh tokens are hashed and rotate once under concurrency.
Account locks block access and refresh and revoke sessions atomically with account updates.
Raw exception/SQL/query-string data is not exposed by the shared HTTP error/log layer.

The initial runtime audit reported 15 dependency findings including 5 high and 1 critical. Final
runtime dependency findings are 7 moderate, **0 high, 0 critical**. Full dev+runtime findings are
8 moderate, **0 high, 0 critical**. `npm audit` without a severity threshold still fails.

Remaining root advisories concern Nest SSE interpolation, file-type parsing and uuid v3/v5/v6
buffer bounds. Source search found no SSE endpoints, binary file validators/uploads, or those UUID
calls in this backend's application code. This is an exposure assessment, not removal of the
vulnerabilities. Resolve through a coordinated Nest/dependency upgrade before enabling those paths.
The Nest SSE advisory identifies its patched major/version and prerequisites in the
[upstream advisory](https://github.com/advisories/GHSA-36xv-jgw5-4q75).

bcrypt 6 removes the old node-pre-gyp chain, as documented in its
[release notes](https://github.com/kelektiv/node.bcrypt.js/releases/tag/v6.0.0).
Vitest/coverage were upgraded together to address test-tool advisories; NestJS remains version 10.

## 9. Tests added/updated

- Config: missing/distinct secrets, invalid expiry/ports/SSL/CORS; no legacy-secret fallback.
- Health: connected, disconnected/uninitialized and stalled database.
- Auth/users: roles, policy, hash/token safety, normalized duplicate identifiers, duplicate races,
  login aliases, wrong credentials, locked/suspended accounts, valid/expired/invalid tokens,
  rotation/reuse races, ownership-scoped logout, protected profile fields, pagination and RBAC.
- Catalog: inactive category/service and public bypass attempts, prices, booleans, duplicate code,
  Admin/Service Manager permissions and soft deletion.
- Verification: ownership, bad metadata/count/size/MIME, duplicate submission races, transactional
  rollback, pending-only review races, audit fields, rejection/resubmission, inactive accounts.
- HTTP/DB: real bootstrap, Swagger, CORS, Helmet, throttling, database constraints, migration
  up/down/reapply, legacy data preservation and refusal of unsafe rollback.

## 10. Quality gates

| Check | Result | Evidence/limits |
|---|---|---|
| npm ci | PASS | Clean Docker builder and production dependency installations |
| Lint | PASS | No warnings/errors |
| Typecheck | PASS | tsc --noEmit |
| Unit | PASS | 83 tests |
| Build | PASS | Nest build locally and in image |
| E2E | PASS | 47 tests, real isolated PostgreSQL 16 schemas |
| Migration | PASS | Fresh/legacy up; new-schema down/reapply; adopted-table rollback refused; compiled CLI works |
| Runtime audit at high threshold | PASS | npm audit --omit=dev --audit-level=high |
| Full dependency audit | FAIL | 8 moderate findings; 7 in runtime dependency graph |
| Docker production smoke | PASS | Final image: /health, migrated DB, native bcrypt registration, safe response, RBAC, Swagger catalog DELETE; UID 1000 |
| git diff review | PASS | No whitespace errors; no other-member business edits or secret files added |
| Hosted CI execution | NOT VERIFIED | Workflow updated; no remote pipeline was triggered |
| Live Cloudinary/Web/Mobile integration | NOT VERIFIED | Metadata only; clients and Docs-FixHome not modified |

## 11. Remaining issues and practical limits

1. Moderate dependency advisories remain; the full audit is not clean. Do not represent the high
   severity threshold gate as an unrestricted security audit PASS.
2. Actual private document uploads/asset ownership and client refresh/session integration still
   need their owners' implementation/validation. No live credential/customer data was used.
3. Canonical Docs-FixHome contains stale verification routes/reviewer roles, JWT payload and
   pagination examples. Required corrections are provided in the Backend integration guide.
4. Deployment must supply secrets/DB/CORS/storage settings, configure trusted proxies if applicable,
   and provision administrator identities through its approved operational process. This audit did
   not deploy or modify a real database/account.
5. Historical data conflicts or non-UTC naive timestamps need explicit review before migration.
   Destructive rollback of adopted tables is intentionally refused.

## 12–13. Cross-module contracts and overlap check

- Member 2 receives identity/RBAC helpers, ownership query pattern, active-service validation and
  stable catalog IDs. Booking/order/quotation/payment code remains untouched.
- Member 3 receives `isApproved(technicianId)` from verification, scoped to an active technician.
  Profiles, skills, availability, recommendation, assignment and tracking remain untouched.
- Member 4 receives auth/config/shared response contracts. AI, notification, WebSocket, ratings
  and repair history remain untouched. The existing public AI analysis route is an **OVERLAP
  DETECTED** item for Member 4 to confirm its intended public/private/quota policy; no AI business
  logic or authorization policy was changed here.
- No second guard/decorator/filter/state machine or storage-provider implementation was introduced.

## 14. Contract changes

**Intentional changes:** missing JWT secrets now stop startup; weak/oversized passwords and malformed
body types are rejected; phone identifiers normalize to local 0-prefix; public catalog cannot expose
inactive records; logout returns documented `data.loggedOut`; pagination empty totalPages is 0;
verification metadata is bound to configured Cloudinary. Catalog manager permissions match Docs.

**Additive compatibility:** login identifier alias while retaining email; category route aliases;
catalog admin reads and soft-delete endpoints. Existing success/error envelopes and role/status
values remain. The integration guide supplies endpoint/request/response/consumer actions.

## 15. Final review and Definition of Done

| Review role | Result | Review conclusion |
|---|---|---|
| BA | PASS | Actors, inputs, states and module scope traced to request and canonical requirements |
| PM | PASS | Backend-only scope; no UI, business-flow takeover, deployment or extra infrastructure |
| CTO/Tech Lead | PASS | Nest module boundaries retained; shared bootstrap; transactional persistence and migrations |
| Senior Developer | PASS | Existing implementation repaired; explicit DTOs and no controller database access |
| Security | PASS | Critical application findings fixed; high/critical dependency gate clean; moderate risks documented |
| Tester | PASS | Positive/negative/permission/concurrency/error/migration paths executed |
| QA/QC | PASS | API/schema/code/tests reconciled; cross-repo documentation/client actions explicitly handed over |

**Final Definition of Done: PASS for Member 1 Capstone backend and its declared quality gates.**
Full dependency audit remains FAIL; hosted CI, real storage and cross-client deployment remain
NOT VERIFIED. These limits prevent claiming unrestricted production readiness.
