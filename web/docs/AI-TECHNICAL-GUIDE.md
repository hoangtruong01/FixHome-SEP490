# Frontend-FixHome AI Technical Guide

This document governs all human and AI changes in this independent Vue repository. Preserve the
current client architecture and do not move Backend business logic into the browser.

## 1. Repository Purpose

Frontend-FixHome owns the Vue web experience, currently centered on the Admin/Service Manager
portal: layouts, pages, browser routing, Pinia client state, typed Backend integration, and static
assets. It may present Customer web capabilities when approved by requirements.

It does not own business validation, authoritative permissions, database access, order state
transitions, or AI-provider calls. Those remain in Backend-FixHome and AI-FixHome. Cross-system
requirements and contracts belong in Docs-FixHome.

## 2. Technology Stack

- Node.js 20.19+ and npm with deterministic `npm ci`
- Vue 3 Composition API and TypeScript 6
- Vite 8 build/dev tooling and `@vitejs/plugin-vue`
- Tailwind CSS 4 through the Vite plugin
- Pinia for client state and Vue Router for navigation
- Axios for the Backend REST API
- ESLint with the official Vue TypeScript configuration
- Vitest for unit tests and `vue-tsc` for type checking

Do not replace Pinia, Vue Router, Axios, Tailwind, Vite, or test/lint tooling without explicit scope.

## 3. Existing Architecture

```text
src/main.ts
  -> App.vue
  -> Vue Router + global auth guard
  -> auth/admin layouts
  -> route pages
  -> Pinia stores and typed utilities
  -> shared Axios client / endpoint modules
  -> Backend-FixHome REST API
```

`src/api/client.ts` centralizes base URL, timeout, JWT attachment, and 401 handling. Endpoint files
use that client. `src/stores` owns client session/UI state. `src/router` defines lazy routes and
navigation guards. Layouts provide shells; pages orchestrate user interactions. Components should
be introduced under `src/components` only when reuse justifies them.

Route guards improve UX but are not a security boundary. Backend must repeat every permission and
ownership decision.

## 4. Folder Structure

- `.github/workflows/`: independent web CI.
- `public/`: assets served without bundling.
- `src/api/`: Axios client and resource-specific endpoint calls.
- `src/assets/`: bundled images and global Tailwind/CSS entry.
- `src/layouts/`: reusable page shells.
- `src/pages/`: route-level Vue SFCs, currently login, dashboard, and not-found.
- `src/router/`: route table and global guards.
- `src/stores/`: Pinia stores, including auth state.
- `src/types/`: API and domain-facing TypeScript contracts.
- `src/utils/`: small browser utilities such as token storage.
- `tests/`: Vitest unit tests and test setup.
- `docs/`: repository-local governance.

## 5. Coding Rules

- Use Vue SFCs with `<script setup lang="ts">` and Composition API unless the existing file uses a
  justified alternative.
- Component names use PascalCase; composables use `useX`; Pinia stores use `useXStore`; endpoint
  modules use `<resource>.api.ts`; variables/functions use camelCase.
- Keep pages thin: reusable visual behavior goes in components/composables and shared state goes in
  Pinia. Do not turn stores into a second business-service layer.
- Use the shared Axios client. Do not duplicate base URLs, token interceptors, or response handling.
- API types reflect Backend contracts exactly. Do not hide an API mismatch with broad `any`, unsafe
  assertions, or client-only enum variants.
- Validate user input for immediate feedback, but assume Backend performs authoritative validation.
- Show safe, actionable errors; do not render stack traces or raw provider/database messages.
- Use Tailwind and existing design tokens/styles consistently. Avoid unrelated visual rewrites.
- Only read browser configuration through `import.meta.env.VITE_*`; document additions in
  `.env.example`. Never place secrets in frontend environment variables.
- Reuse existing code, change the minimum files, and avoid speculative components/abstractions.

## 6. Business Rules

- Primary actors are Service Manager and Admin on web; Customer behavior must follow approved Docs.
- Backend is authoritative for JWT, RBAC, ownership, validation, quotation approval, assignment,
  and state transitions. Hiding a button never grants or denies real permission.
- Role strings remain `customer`, `technician`, `service_manager`, and `admin` across all clients.
- Display Service Order states from Backend without independently inventing transitions:

```text
PENDING_CONFIRMATION -> ACCEPTED -> EN_ROUTE -> UNDER_REPAIR -> COMPLETED
PENDING_CONFIRMATION or ACCEPTED -> CANCELLED
```

- Booking and Service Order are separate concepts and must not share status values accidentally.
- AI results are advisory, carry confidence/disclaimer information, and must allow manual fallback.
- Never present scaffolded endpoints/features as operational.

## 7. Security Rules

- Treat localStorage JWTs as sensitive. Never log, render, or include them in error telemetry; clear
  them on invalid sessions. Do not store passwords or provider keys.
- Prevent XSS by relying on Vue escaping; avoid `v-html`. If explicitly required, sanitize with an
  approved and tested policy.
- UI role checks are convenience only. Never assume they prevent IDOR or unauthorized API calls.
- Validate upload type/size before UX submission while relying on Backend for final enforcement.
- Do not put secrets in `VITE_*`, source, assets, test fixtures, or build logs.
- Keep API calls same-origin/CORS-aware and use HTTPS in deployed environments.
- Review authentication state, authorization UX, XSS, unsafe URLs, sensitive data exposure, error
  leakage, and dependency risk for relevant changes.

## 8. Testing Rules

- Unit-test Pinia state, route decisions, formatters, validation behavior, API mapping, and error
  handling with Vitest.
- For pages/components, test user-observable behavior and permissions, not internal implementation.
- Include happy, negative, boundary, invalid-input, permission, network/error, and regression cases
  appropriate to the change.
- Mock the Axios boundary; unit tests must not call live Backend or AI services.
- Contract-sensitive work must be checked against current Backend DTO/enums and Docs.
- `npm run typecheck` is distinct from runtime tests; both must pass.

## 9. CI/CD Rules

`.github/workflows/ci.yml` runs independently for pushes and pull requests targeting `main`,
`development`, or the retained `develop` alias:

```text
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

Every command is a blocking quality gate; do not add `continue-on-error`. Deployment of `dist/`
requires a separate approved workflow, environment, and hosting configuration. No server secret may
be injected into the static bundle.

## 10. AI Development Workflow

Execute this sequence before reporting completion:

```text
Task
-> read this guide and relevant Docs-FixHome requirements/contracts
-> inspect routes/pages/stores/API/types/tests/dependencies
-> BA analysis: actor, use case, input/output, rule, validation, permission, API/state, edge cases,
   affected repositories
-> PM review: exact scope, necessity, no unrequested feature/refactor
-> CTO/Tech Lead review: existing boundaries, API compatibility, state ownership, maintainability
-> impact analysis and minimum implementation
-> Senior Developer review
-> Security review
-> Tester review
-> QA/QC trace: requirement -> Backend contract -> client state/API -> UI -> tests -> docs
-> lint/typecheck/test/build
-> git diff and unintended-change review
-> final architecture review
-> PASS, FAIL, or BLOCKED/NOT VERIFIED
```

When a review finds a defect, analyze root cause, fix, rerun affected gates, and repeat review. Final
reporting includes Task, Repository, Analysis, Files Changed, Implementation, role-by-role Review,
Technical Validation, Issues Found, Auto Fix, Remaining Issues, and Final Status. Only executed
successful checks are `PASS`; unavailable checks are `NOT VERIFIED`.
