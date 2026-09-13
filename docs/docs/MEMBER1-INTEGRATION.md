# Member 1 — Integration contract and local operation

Reviewed 2026-09-09 against the actual Backend-FixHome implementation, the attached audit request,
and Docs-FixHome requirements/API documents. Only Backend-FixHome was edited.

## Start and migrate

1. Use Node 20.19+ and `npm ci` (PowerShell may require `npm.cmd`).
2. Copy `.env.example` to a private `.env`; set two **different random JWT secrets**, each at
   least 32 characters. Legacy `JWT_SECRET` no longer supplies access/refresh secrets.
3. Set database connection values and exact comma-separated CORS origins. Wildcard CORS is rejected.
4. Start PostgreSQL, then run `npm run migration:run`, then `npm run start:dev`.
   Development and production both use migrations; synchronization is disabled.
5. Check `/health` and `/api/docs`. `/api/v1/health` remains an alias.

Docker workflow: `docker compose up -d postgres`,
`docker compose run --rm backend npm run migration:run:prod`, then `docker compose up -d backend`.
The compiled migration command works without TypeScript/dev dependencies in the production image.
Compose is a local/demo configuration; production credentials/network settings belong in the
deployment environment. There is no automatic deployment or migration job in CI.

`DATABASE_SSL=true` verifies the server certificate. Install a trusted CA through the runtime's
normal trust configuration; certificate verification is not disabled.

## Request/response rules

- Base path: `/api/v1`. Private requests require `Authorization: Bearer <accessToken>`.
- Success: `{ success: true, statusCode, message, data, meta? }`.
- Error: `{ success: false, statusCode, error: { code, message, details? }, timestamp, path }`.
- Pagination: page defaults to 1, limit defaults to **10**, max 100; both must be integers.
  Empty results have `totalPages: 0`.
- Unknown body fields are rejected. Send actual JSON booleans/numbers; implicit conversion of
  body strings is disabled. Query pagination and `isActive=true|false` are explicitly converted.
- Roles: `customer`, `technician`, `service_manager`, `admin`.
- Account fields remain `status` (`active|locked|suspended`) and compatible `isActive`.
  Change status only through UsersService; it updates both fields and revokes sessions atomically.
- PostgreSQL `numeric(12,2)` catalog prices retain the existing driver representation in responses
  (decimal strings or null). Request prices are JSON numbers, at most two decimals, within
  0..9999999999.99. Catalog prices are advisory values, not order/quotation totals.

## Member 2 — Auth, user and catalog

Import `JwtAuthGuard`, `RolesGuard` from `src/common/guards`, and `Roles`, `CurrentUser` from
`src/common/decorators`. Old `modules/auth/guards` and `modules/auth/decorators` exports are aliases,
not separate implementations.

Use `@CurrentUser('id')` for the actor ID. The JWT strategy reloads the account and role from the
database on each authenticated request. Query resources using both the requested ID and the
actor's ownership key; do not trust a submitted customer/technician ID. For example, a future
owner's service should query `where: { id: resourceId, customerId: actorId }`, with explicitly
defined privileged-role exceptions. Member 1 does not implement booking ownership or order transitions.

Import `ServicesModule` and call `ServicesService.findActiveById(serviceId)` before accepting a
service selection. It rejects inactive services and services in inactive categories. All catalog
DELETE operations deactivate records. Member 2 owns price snapshots, quotations and final pricing.

## Member 3 — Verification

Import `TechnicianVerificationsModule`; call
`TechnicianVerificationsService.isApproved(technicianId)`. This checks the verification domain's
`approved` status and the technician's active account/role. It does not assign or recommend workers.
`technician_verifications.status` is the only verification state; no verification field is added to User.

Technician endpoints: `POST/GET /api/v1/technicians/me/verification` (also supports legacy route `/api/v1/technician/verification` and `/api/v1/technician/verification/status`).
No submission returns `data: null`. Rejected submissions can be resubmitted as a new record.
Only one pending/approved record may exist per technician. Only pending records can be reviewed.
Suspended/locked accounts cannot submit; an inactive technician cannot be approved/rejected.

Admin endpoints: `GET /api/v1/admin/technician-verifications`, `GET /:id`,
`PATCH /:id/approve`, `PATCH /:id/reject`. Rejection requires trimmed `rejectionReason` of 5..2000
characters. Reviewer ID and time are persisted. These operations are **Admin only**, following
the explicit attached request rather than the older Admin/Service Manager statement in Docs-FixHome.

Verification currently accepts **metadata only**, not binary uploads. Configure
`CLOUDINARY_CLOUD_NAME` to enable submission. Documents must use an HTTPS `res.cloudinary.com`
upload URL under that cloud, without credentials/query/fragment; 1..10 documents, 1 byte..10 MiB
each; JPEG/PNG/WebP/PDF MIME allowlist and matching filename extensions. The backend does not fetch
the URL. It cannot prove declared file bytes, ownership or private asset delivery from metadata.
The storage/media owner must establish authenticated uploads and private access before using real
identity documents. This audit did not implement a second storage provider or a binary upload API.

## Member 4 — Shared infrastructure

Consume the same JWT/RBAC/CurrentUser helpers, ConfigService, DTO validation and response/error
envelopes. Core health depends only on PostgreSQL; AI failure is independent. AI, notifications,
WebSocket/SSE, ratings and repair history remain Member 4's responsibility.

## Web/Mobile actions and Docs-FixHome reconciliation

| Area | Final contract | Consumer action |
|---|---|---|
| Login | `{ identifier, password }` or compatible `{ email, password }` | Existing email calls remain valid; avoid conflicting aliases |
| Auth response | `data: { accessToken, refreshToken, user }` | Add refreshToken to existing LoginResponse types; read the envelope's data |
| Refresh | POST `/auth/refresh`, `{ refreshToken }`, rotated token pair | Replace stored refresh token atomically; serialize refresh requests |
| Logout | POST `/auth/logout`, optional `{ refreshToken }`; `data: { loggedOut: true }` | Supply current token to revoke one session; omitted token revokes all |
| Profile | GET `/auth/me` or GET/PATCH `/users/me` | The FE scaffold's commented `/auth/profile` is not an implemented endpoint |
| Catalog | `/service-categories` plus `/categories` alias; `/services` | Public reads always active; management uses admin endpoints |
| Catalog managers | Admin and Service Manager, per `api/SERVICE_CATALOG.md` | Service Manager may manage catalog, but cannot manage users or approve verification |
| Catalog status | PATCH `/:id/status`, `{ isActive: boolean }`; DELETE deactivates | Use JSON booleans; removed public inactive access is intentional |
| Verification | `/technicians/me/verification`, Admin-only review | Canonical route `/technicians/me/verification`; `/technician/verification` supported as alias |
| Metadata | Cloudinary cloud validation and file/count bounds | Configure storage and submit valid metadata; no fabricated URL |
| Pagination | Default 10, totalPages 0 for empty result | Updated pagination default in catalog/users |
| JWT/config | Separate secrets required; payload identity/role only | Use profile response for email; set deployment secrets before startup |

Frontend/Mobile authentication modules are still scaffolded. Their role values match Backend;
their LoginResponse currently lacks refreshToken. Cross-client end-to-end consumption and the
canonical Docs-FixHome edits were not performed because the request permits editing Backend only.

## Migration safety

InitialBaseline adopts the old users table by adding status and retaining inactive accounts as
locked. CoreIntegrity normalizes email/phone, interprets old naive timestamps as UTC, preserves
hashes/rows, revokes ambiguous duplicate refresh-token hashes, and adds price/verification constraints.

Existing duplicate identifiers, multiple open verifications or invalid prices cause migration to
fail rather than silently delete data. Review such records before applying migrations to real data.
Confirm the UTC assumption if a legacy database used a different timezone.

Full rollback is tested for newly created tables. Baseline/catalog rollback refuses to drop tables
adopted from an existing database (or older installations without ownership markers). Use a reviewed
forward migration for those databases. CoreIntegrity down removes its new constraints/index while
retaining normalized identifiers, timestamps and security revocations.

## Verification commands

`npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm run test:e2e`.
E2E requires PostgreSQL connection ENV and creates a random `member1_e2e_*` schema, runs/reverts
migrations, and removes only that schema. It does not use synchronize or drop the database.
No live AI/storage provider is called. CI adds `npm audit --omit=dev --audit-level=high`.

Throttling is in-process and limited to registration (5/min), login (10/min), refresh (30/min) per
observed IP/route. Health and other routes do not inherit those limits. Multiple instances and
reverse proxies require deployment-specific rate limiting/trusted-proxy configuration; do not
blindly trust client-supplied forwarding headers.
