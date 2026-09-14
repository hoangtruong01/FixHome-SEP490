# FixHome Mobile — Agent Instructions

This Expo application is an independent Git repository and a UI client of Backend-FixHome.

## Mandatory pre-implementation gate

Before doing any task:

1. Read `docs/AI-TECHNICAL-GUIDE.md` completely.
2. Inspect the existing project structure and affected navigator, screen, store, or service.
3. Understand the current Expo/React Navigation/Zustand/API-client architecture.
4. Identify existing TypeScript, React Native, navigation, state, and test conventions.
5. Check `package.json`, `app.json`, Expo compatibility, and relevant dependencies.
6. Search for an existing implementation before creating code.
7. Do not modify unrelated files.
8. Do not restructure or eject/prebuild the project unless explicitly requested.
9. Preserve Backend API contracts, enum values, permissions, and business rules.
10. After implementation, execute the complete review process in the technical guide.

If the technical guide has not been read, implementation must not begin.

## Repository rules

- Use the exact Expo SDK declared in `package.json`; use `npx expo install` for native packages.
- Keep business rules and authoritative authorization in Backend.
- Store tokens only through `expo-secure-store`; do not use AsyncStorage for credentials.
- Keep navigation params typed and preserve role-specific Customer/Technician flows.
- Never call Gemini/OpenAI or a database directly from the app.
- Coordinate contract changes with Backend, Frontend, AI, and Docs repositories.

## Required verification

Use Node 22.13 or newer. Run `npm run check:expo`, `npm run lint`, `npm run typecheck`, and
`npm test`. Review `git diff` and report unexecuted device/E2E checks as `NOT VERIFIED`.
