# FixHome — AI Agent Instructions

> **This file is the entry point for all AI Coding Agents working on the FixHome repository.**
> Read the files listed below **in order** before writing any code.

## Mandatory Reading Order

1. **This file** — `AGENTS.md` (rules and constraints)
2. **[PROJECT_DOCUMENTATION.md](docs/PROJECT_DOCUMENTATION.md)** — Single Source of Truth for project knowledge
3. **[AI_DEVELOPMENT_WORKFLOW.md](docs/AI_DEVELOPMENT_WORKFLOW.md)** — Mandatory development workflow
4. **[CURRENT_TASKS.md](docs/CURRENT_TASKS.md)** — Current project status and task backlog
5. **Related requirement documentation** in `docs/requirements/`
6. **Related source code** in the module you are modifying
7. **Related tests** adjacent to the code

## Mobile-Specific

When working on the `mobile/` project, also read:
- `mobile/AGENTS.md` — Expo version-specific constraints

---

## Absolute Rules

### Before Any Code Change

- **Never code before reading context.** Understand the requirement, existing implementation, and documentation first.
- **Never invent requirements.** If a requirement is not documented, ask — do not assume.
- **Never add scope silently.** If a task does not cover a module, do not modify it without explicit approval.

### Architecture

- **Never bypass JWT/RBAC.** Every protected endpoint must use `JwtAuthGuard` and `RolesGuard`.
- **Never bypass the State Machine.** Service Order status transitions must go through `ServiceOrderStateMachine`.
- **Never silently change API contracts.** If a backend endpoint signature changes, search and update Web, Mobile, and documentation.
- **Never silently change Database schema.** Schema changes require a TypeORM migration, not `synchronize: true`.
- **NestJS Backend is the authoritative business layer.** Web and Mobile are UI clients only — they must not contain business logic.
- **AI Service is advisory only.** It must never control transactions, approve quotations, or change order state.

### Quality

- **Never fake implementation.** Placeholder code must be clearly marked with `// TODO:` comments.
- **Never fake test results.** Only report `PASS` for tests that were actually executed successfully. Use `NOT VERIFIED` otherwise.
- **Never claim DONE without verification.** Every task must be verified against its Acceptance Criteria.
- **Never delete code without checking usages.** Search the entire repository before removing any export, function, or file.
- **Never delete documentation before merging valid information.** Preserve architecture decisions and business rules.

### Cross-System Consistency

- **Every task must check:** Backend, Database, API, Web, Mobile, AI, Security, Testing, Documentation.
- **Documentation must stay consistent with implementation.** Update docs when code changes.
- **Web and Mobile must use the same Backend API contract.** No workaround APIs without documented justification.
- **Enums and status values must be identical** across Backend, Web, and Mobile.

---

## Technology Stack — Do Not Change Without Approval

| Layer | Stack |
|-------|-------|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL |
| Web | Vue.js 3, TypeScript, TailwindCSS 4, Pinia |
| Mobile | React Native (Expo 57), TypeScript, Zustand |
| AI Service | FastAPI, Python, Gemini / OpenAI |
| Auth | JWT + RBAC |
| Database | PostgreSQL 16, UUID PKs, snake_case |

---

## Service Order State Machine

```
PENDING_CONFIRMATION → ACCEPTED → EN_ROUTE → UNDER_REPAIR → COMPLETED
                  ↘          ↘
               CANCELLED   CANCELLED
```

- `COMPLETED` and `CANCELLED` are terminal states.
- Backend validates all transitions via `ServiceOrderStateMachine`.
- Frontend must never enforce state logic independently — it reads allowed transitions from Backend.

---

## Document Status Labels

When describing feature status in documentation, use exactly one of:

| Label | Meaning |
|-------|---------|
| `PLANNED` | Requirement exists, no code written |
| `SCAFFOLDED` | Module/file/interface exists, business logic not implemented |
| `IMPLEMENTED` | Business functionality coded |
| `TESTED` | Tests exist and have been executed |
| `VERIFIED` | Implementation + tests + QA review confirmed |
| `BLOCKED` | Cannot proceed due to dependency/blocker |

> Having a controller file does **not** mean a feature is implemented.
