# FixHome Web Frontend — Agent Instructions

This Vue application is an independent Git repository and a UI client of Backend-FixHome.

## Mandatory pre-implementation gate

Before doing any task:

1. Read `docs/AI-TECHNICAL-GUIDE.md` completely.
2. Inspect the existing project structure and affected route, page, store, or API module.
3. Understand the current Vue/Pinia/router/API-client architecture.
4. Identify existing TypeScript, Vue SFC, styling, state, and test conventions.
5. Check `package.json`, Vite/TypeScript configuration, and relevant dependencies.
6. Search for an existing implementation before creating code.
7. Do not modify unrelated files.
8. Do not restructure the project unless explicitly requested.
9. Preserve Backend API contracts, enum values, permissions, and business rules.
10. After implementation, execute the complete review process in the technical guide.

If the technical guide has not been read, implementation must not begin.

## Repository rules

- Keep business rules and authoritative authorization in Backend; route guards are UX only.
- Use the shared Axios client and Pinia stores instead of duplicating transport or state logic.
- Keep request/response types and enums aligned with Backend and Mobile.
- Never call Gemini/OpenAI or a database directly from the browser.
- Never expose server secrets through `VITE_*`; all such values are public at build time.
- Coordinate contract changes with Backend, Mobile, AI, and Docs repositories.

## Required verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Review `git diff` and
report unexecuted checks as `NOT VERIFIED`; never convert them to `PASS`.
