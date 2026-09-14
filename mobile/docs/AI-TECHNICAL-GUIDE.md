# Mobi-FixHome AI Technical Guide

This document governs all human and AI changes in this independent Expo repository. Preserve the
managed Expo architecture, typed navigation, and Backend ownership of business rules.

## 1. Repository Purpose

Mobi-FixHome owns the React Native mobile experience for Customer and Technician actors: screens,
role-aware navigation, Zustand client state, secure device token storage, typed Backend API access,
and native application assets/configuration.

It does not own authoritative validation, authorization, order transitions, database access, or
direct Gemini/OpenAI logic. Those belong to Backend-FixHome and AI-FixHome. Service Manager/Admin
operations primarily belong to Frontend-FixHome unless requirements explicitly add mobile scope.

## 2. Technology Stack

- Node.js 22.13+ and npm with `package-lock.json`
- Expo SDK 57 managed workflow and React Native 0.86
- React 19 and TypeScript 6 strict mode
- React Navigation native stack and bottom tabs
- Zustand for client state
- Axios for Backend requests
- `expo-secure-store` for credentials
- Expo ESLint flat configuration
- Jest with the `jest-expo` preset
- Expo CLI compatibility checks

Use `npx expo install` for Expo/native dependencies so versions remain SDK-compatible. Do not eject,
prebuild, or add native projects unless the task explicitly requires and approves it.

## 3. Existing Architecture

```text
index.ts
  -> App.tsx
  -> NavigationContainer / AppNavigator
  -> AuthNavigator, CustomerNavigator, or TechnicianNavigator
  -> role-specific screens
  -> Zustand stores and device services
  -> shared Axios API client
  -> Backend-FixHome REST API
```

`AppNavigator` selects auth/customer/technician flows from session state. `src/services` wraps
native capabilities such as SecureStore. `src/api/client.ts` centralizes URL, timeout, secure token
attachment, and 401 handling. `src/constants/config.ts` reads Expo public configuration.

Client navigation is not an authorization boundary. Backend repeats all role and ownership checks.

## 4. Folder Structure

- `.github/workflows/`: independent mobile CI.
- `assets/`: Expo icon, splash, favicon, and adaptive Android images.
- `App.tsx` and `index.ts`: application entry points.
- `src/navigation/`: typed root, auth, customer, and technician navigators.
- `src/screens/`: actor/feature screen implementations.
- `src/store/`: Zustand state and unit tests.
- `src/services/`: native/device adapters, especially secure token storage.
- `src/api/`: shared Backend client and endpoint modules.
- `src/types/`: API, auth, and navigation contracts.
- `src/constants/`: environment-derived configuration and theme.
- `app.json`: Expo application/native metadata.
- `docs/`: repository-local governance.

## 5. Coding Rules

- Components/screens use PascalCase; hooks/stores use `useX`; variables/functions use camelCase.
- Keep navigation params declared in typed param lists; do not use untyped route payloads.
- Screens orchestrate UI. Reusable device/API/state behavior belongs in services, API modules, or
  Zustand stores rather than being copied across screens.
- Keep Zustand actions deterministic and small; do not duplicate Backend business logic in stores.
- Use the shared Axios client and secure storage adapter. Never duplicate token lookup/interceptors.
- Keep API types/enums byte-for-byte semantically aligned with Backend and Frontend.
- Validate input for user feedback while treating Backend validation as authoritative.
- Present safe errors and offline/retry states; do not expose stack traces or raw service messages.
- Read public runtime configuration from `EXPO_PUBLIC_*` and document it in `.env.example`. These
  values are bundled and must never contain secrets.
- Add dependencies only when required, using Expo-compatible versions; avoid unrelated upgrades.

## 6. Business Rules

- Customer can authenticate, request diagnosis/booking, view/approve quotations, track orders, and
  review completed service as approved requirements are implemented.
- Technician can see assigned work and request permitted progress transitions; Backend decides if a
  transition is valid for that user/order.
- Keep roles aligned: `customer`, `technician`, `service_manager`, `admin`.
- Never invent Service Order transitions. Display the Backend-authorized lifecycle:

```text
PENDING_CONFIRMATION -> ACCEPTED -> EN_ROUTE -> UNDER_REPAIR -> COMPLETED
PENDING_CONFIRMATION or ACCEPTED -> CANCELLED
```

- Booking and Service Order are separate lifecycles.
- AI diagnosis is advisory only. Low-confidence/failure states must allow manual service selection
  and may never directly authorize a transaction or update an order.
- Do not expose scaffolded screens/features as complete.

## 7. Security Rules

- Persist authentication tokens only with `expo-secure-store`. Never put credentials in Zustand
  persistence, AsyncStorage, logs, crash breadcrumbs, screenshots, or source.
- Mobile route/role checks provide UX only; Backend JWT, RBAC, and ownership checks are mandatory.
- Treat deep links, remote images, user text, AI data, and API URLs as untrusted.
- Do not embed server/API-provider secrets in `EXPO_PUBLIC_*`, `app.json`, assets, or JS bundles.
- Clear invalid tokens on 401 and design refresh/session behavior explicitly before implementing it.
- Request native permissions only at point of use, explain purpose, and handle denial safely.
- Validate upload type/size locally for UX and require Backend enforcement.
- Review auth, RBAC/IDOR, transport, local storage, input, deep link, upload, secret, data exposure,
  and error leakage risks where relevant.

## 8. Testing Rules

- Use Jest/`jest-expo` for Zustand actions, services/adapters, navigation decisions, API mapping, and
  screen behavior. Mock native modules at their boundary.
- Include happy, negative, boundary, invalid-input, permission, offline, timeout, 401, and regression
  cases appropriate to the task.
- Unit tests must not contact real Backend, AI providers, SecureStore, or device services.
- `npm run check:expo`, lint, type checking, and Jest test different failure classes; none substitutes
  for another.
- Device/emulator and E2E behavior is `NOT VERIFIED` unless it was actually executed and observed.

## 9. CI/CD Rules

`.github/workflows/ci.yml` runs independently for pushes and pull requests targeting `main`,
`development`, or the retained `develop` alias, on the Node version from `.nvmrc`:

```text
npm ci
npm run check:expo
npm run lint
npm run typecheck
npm test
```

All are blocking quality gates; do not use `continue-on-error`. Store signing, EAS credentials, and
release builds require a separate approved workflow/protected environment. CI must never print
tokens or signing secrets.

## 10. AI Development Workflow

```text
Task
-> read this guide, relevant Docs-FixHome requirements, and exact Expo SDK documentation
-> inspect navigation/screens/store/services/API/types/tests/config/dependencies
-> BA analysis: Customer/Technician actor, requirement, input/output, rule, validation, permission,
   API/state/device behavior, edge cases, affected repositories
-> PM scope review
-> CTO/Tech Lead review: managed Expo constraints, boundaries, contracts, compatibility
-> impact analysis and minimum implementation
-> Senior Developer review
-> Security review
-> Tester review, including offline/device/permission cases where relevant
-> QA/QC trace: requirement -> Backend/API -> state/navigation -> screen -> tests -> docs
-> Expo check/lint/typecheck/test
-> git diff and unintended-change review
-> final architecture review
-> PASS, FAIL, or BLOCKED/NOT VERIFIED
```

If an issue appears, find root cause, fix, rerun, and repeat review. Final reporting includes Task,
Repository, Analysis, Files Changed, Implementation, role reviews, Technical Validation, Issues
Found, Auto Fix, Remaining Issues, and Final Status. Never claim device/E2E or release PASS without
running it.
