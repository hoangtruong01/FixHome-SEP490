# Backend-FixHome AI Technical Guide

This document is the mandatory technical governance contract for every human or AI change in this
repository. It describes the repository as it exists; it does not authorize unrequested features
or large refactors.

## 1. Repository Purpose

Backend-FixHome owns the authoritative FixHome business API, authentication/authorization,
validation, Service Order lifecycle, TypeORM persistence, migrations, and the local PostgreSQL
development container. It integrates with AI-FixHome through the `ai-diagnosis` module.

It does not own Vue or Expo UI behavior, direct Gemini/OpenAI provider logic, or cross-project
requirements. Those belong to Frontend-FixHome, Mobi-FixHome, AI-FixHome, and Docs-FixHome.

Primary actors are Customer, Technician, Service Manager, and Admin. System/CI is the actor for
health checks and operational validation.

## 2. Technology Stack

- Node.js 20.19+ and npm with `package-lock.json`/`npm ci`
- NestJS 10 and TypeScript 5.7
- TypeORM 0.3 with PostgreSQL 16
- JWT/Passport and role guards; bcrypt for password hashing
- `class-validator`/`class-transformer` DTO validation
- Axios for the FastAPI integration
- Helmet, CORS, Swagger, RxJS
- OxLint, TypeScript compiler, Vitest, Supertest, and Nest CLI
- Docker Compose for the development database

Do not upgrade frameworks or replace tooling as part of an unrelated feature or bug fix.

## 3. Existing Architecture

The runtime request path is:

```text
HTTP request
  -> Nest bootstrap (`src/main.ts`)
  -> Helmet/CORS/global prefix/ValidationPipe
  -> JWT and role guards when the route is protected
  -> feature controller
  -> feature service
  -> TypeORM repository/entity or an external adapter
  -> PostgreSQL or AI-FixHome
  -> global transform interceptor / exception filter
  -> HTTP response
```

`AppModule` composes the database and feature modules. Features remain isolated under
`src/modules/<feature>`. Cross-cutting filters/interceptors are under `src/common`; shared DTOs,
enums, and constants are under `src/shared`. `DatabaseModule` owns runtime TypeORM configuration,
while `src/database/data-source.ts` exists for migration CLI commands.

Most feature modules are currently scaffolded. A controller/service file is not proof that a
business feature is implemented. Extend the existing module rather than creating a parallel layer.

## 4. Folder Structure

- `.github/workflows/`: this repository's independent CI pipeline.
- `src/main.ts`: bootstrap, security middleware, validation, Swagger, global behavior.
- `src/app.module.ts`: root dependency composition.
- `src/modules/`: domain feature modules such as auth, bookings, service-orders, quotations, media,
  assignment, reviews, notifications, dashboard, and AI diagnosis.
- `src/common/`: global HTTP filters and interceptors.
- `src/shared/`: reusable API DTOs, enums, and constants with no feature ownership.
- `src/database/`: TypeORM configuration, base entity, data source, and migrations.
- `test/`: PostgreSQL-backed end-to-end tests.
- `docker/` and `docker-compose.yml`: local PostgreSQL setup.
- `docs/`: repository-local technical governance.

## 5. Coding Rules

- Follow Nest naming: `*.module.ts`, `*.controller.ts`, `*.service.ts`, `*.entity.ts`, `*.dto.ts`.
- Controllers handle transport concerns; services implement use cases; persistence stays behind
  injected TypeORM repositories. Do not access the database from controllers.
- Keep DTOs explicit and apply `class-validator` rules to all untrusted request data. The global
  pipe strips/forbids undeclared fields and transforms declared values.
- Reuse shared enums/contracts. Do not duplicate Service Order or role strings in feature code.
- Preserve the `/api/v1` contract, response envelope, exception filter, and documented status
  codes unless a coordinated breaking change is explicitly approved.
- Throw appropriate Nest exceptions; never return raw database/provider errors or stack traces.
- Use Nest `Logger` for operational events. Do not log passwords, JWTs, secrets, full sensitive
  payloads, or provider responses containing customer data.
- Read configuration through environment/config services. Update `.env.example` for new variables;
  never hard-code secrets or commit `.env`.
- Add dependencies only when existing Nest/TypeScript capabilities cannot solve the requirement.
- Modify the minimum files required. Avoid mass rename, folder moves, and speculative abstraction.

## 6. Business Rules

- Backend is authoritative for all validation, authorization, ownership, and state changes. Client
  checks never replace server enforcement.
- Booking and Service Order are different lifecycles: Booking represents a request/schedule;
  Service Order represents execution after confirmation and assignment.
- Every Service Order transition must use `ServiceOrderStateMachine`:

```text
PENDING_CONFIRMATION -> ACCEPTED | CANCELLED
ACCEPTED             -> EN_ROUTE | CANCELLED
EN_ROUTE             -> UNDER_REPAIR
UNDER_REPAIR         -> COMPLETED
COMPLETED/CANCELLED  -> terminal
```

- Apply the state machine's role permissions for Customer, Technician, Service Manager, and Admin.
- AI diagnosis is advisory, may be low confidence, and must fail open to manual service selection.
  AI output may not approve quotations, assign technicians, authorize transactions, or change
  order state.
- Customer approval is required for quotations/additional costs when those features are built.
- A review is valid only after a completed service and must respect resource ownership.
- Open business decisions in Docs-FixHome must remain unresolved until stakeholders approve them.

## 7. Security Rules

- Require `JwtAuthGuard` and `RolesGuard` on non-public endpoints and verify resource ownership in
  the service/query layer to prevent IDOR.
- Validate every path, query, and body field; whitelist sortable/filterable fields rather than
  interpolating user input into SQL.
- Hash passwords; never expose password hashes or tokens through entities/DTOs/logs.
- Treat AI responses and remote URLs as untrusted. Apply timeouts and map failures to safe errors.
- For uploads, enforce MIME allowlists, size/count limits, generated object names, authorization,
  and storage isolation before accepting data.
- Keep `synchronize` limited to development. Production/staging changes require reviewed TypeORM
  migrations and rollback consideration.
- Keep secrets in environment/secret stores and use restrictive CORS origins outside development.
- Review authentication, authorization, RBAC, IDOR, injection, XSS propagation, upload handling,
  secret exposure, sensitive data, and error leakage when relevant.

## 8. Testing Rules

- Unit-test services, state rules, guards, validators, and negative/edge cases with Vitest.
- Integration/E2E tests cover HTTP status, validation, authorization, ownership, persistence, and
  external-adapter fallback. Use isolated test configuration/data.
- Service Order work must test every allowed transition, forbidden transition, terminal state,
  same-state attempt, invalid input, and role permission.
- Contract changes require success, validation, permission, error, and backward-compatibility cases.
- Never call paid/live AI providers from deterministic unit CI.
- A check is `PASS` only when its command was executed successfully in the current review.

## 9. CI/CD Rules

`.github/workflows/ci.yml` is independent and runs on pushes and pull requests targeting `main`,
`development`, or the retained `develop` alias. Required gates are:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

PostgreSQL-backed E2E uses an ephemeral CI service. Quality gates must not use
`continue-on-error`. Deployment, migration execution, or secret-bearing release jobs require a
separate approved workflow and protected environment; this CI does not deploy.

## 10. AI Development Workflow

Do not code immediately. Execute and record this flow:

```text
Task
-> read this guide and related canonical Docs-FixHome material
-> inspect existing code/tests/config/dependencies
-> BA analysis (actor, requirement, input/output, rules, validation, permission, API, DB, state,
   edge cases, affected repositories)
-> PM scope review (necessity, no extra scope, no broken requirement, cross-repo impact)
-> CTO/Tech Lead review (architecture, dependency direction, boundaries, contracts, DB,
   maintainability, backward compatibility)
-> impact analysis and minimum-file implementation
-> Senior Developer review
-> Security review
-> Tester review (happy, negative, boundary, invalid, permission, error, regression)
-> QA/QC consistency review (requirement -> architecture -> DB -> API -> implementation -> UI ->
   tests -> documentation)
-> lint/typecheck/test/build
-> git diff and unintended-change review
-> final architecture review
-> PASS, FAIL, or BLOCKED/NOT VERIFIED
```

If review finds an issue: identify root cause, fix it, rerun affected checks, and review again. Do
not fake PASS. Final reporting must include Task, Repository, Analysis, Files Changed,
Implementation, role-by-role Review, Technical Validation, Issues Found, Auto Fix, Remaining
Issues, and Final Status. Each validation line is exactly `PASS`, `FAIL`, or `NOT VERIFIED`.
