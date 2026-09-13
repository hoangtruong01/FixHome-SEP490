# FixHome Repository Guide

FixHome uses five active repositories with explicit ownership boundaries plus the independent
legacy `FixHome-SEP490` migration snapshot. New development must be committed to the active owning
repository instead of the legacy snapshot.

## Repository Ownership

| Repository | Owns | Does not own |
|------------|------|--------------|
| [Backend-FixHome](https://github.com/FixHome-SEP490/Backend-FixHome) | NestJS API, TypeORM entities and migrations, PostgreSQL development container | Web, Mobile, AI provider implementation |
| [Frontend-FixHome](https://github.com/FixHome-SEP490/Frontend-FixHome) | Vue web UI, browser API client and UI types | Business rules and database access |
| [Mobi-FixHome](https://github.com/FixHome-SEP490/Mobi-FixHome) | Expo app, navigation, device storage and mobile API client | Business rules and direct AI-provider calls |
| [AI-FixHome](https://github.com/FixHome-SEP490/AI-FixHome) | FastAPI diagnosis endpoint, schemas and provider adapters | Transactions, authorization and order state |
| [Docs-FixHome](https://github.com/FixHome-SEP490/Docs-FixHome) | Requirements, architecture, API/database contracts, test plans and project governance | Executable application code |
| [FixHome-SEP490](https://github.com/hoangtruong01/FixHome-SEP490) | Legacy migration source and integrated historical snapshot | Ongoing feature ownership or active deployment |

The legacy [FixHome-SEP490](https://github.com/hoangtruong01/FixHome-SEP490) repository is the
migration source. Keep it read-only after the five repository histories are published and verified.

## Recommended Local Layout

Clone the repositories as siblings so developers can work across contracts without nesting Git
repositories:

```text
FixHome-workspace/
├── Backend-FixHome/
├── Frontend-FixHome/
├── Mobi-FixHome/
├── AI-FixHome/
├── Docs-FixHome/
└── FixHome-SEP490/       # Legacy snapshot; keep read-only for feature work
```

Each directory is an independent Git repository. Do not add a `.git` directory above them and do
not copy one repository inside another.

## Runtime Baseline

| Repository | Runtime | Verification |
|------------|---------|--------------|
| Backend | Node 20.19+ (`.nvmrc`) | lint, typecheck, unit/E2E test, build |
| Frontend | Node 20.19+ (`.nvmrc`) | lint, typecheck, unit test, build |
| Mobile | Node 22.13+ (`.nvmrc`) | Expo check, lint, typecheck, Jest |
| AI | Python 3.11 (`.python-version`) | Ruff, Pytest, import/compile/startup |
| Docs | Node 20+ and UTF-8 Markdown | Markdown, local links, governance validation |
| Legacy snapshot | Per embedded project | Repository workflow validates each snapshot independently |

## Local Startup Order

1. In Backend, copy `.env.example` to `.env` and run `docker compose up -d` for PostgreSQL.
2. Start AI on port `8000` after creating its local `.env`.
3. Start Backend on port `3000`; it calls AI through `AI_SERVICE_URL`.
4. Start Frontend on port `5173` and/or Mobile through Expo (Metro defaults to port `8081`).

Frontend and Mobile call Backend only. They must not call Gemini or OpenAI directly.

## Cross-Repository Change Rule

When an API, enum, environment variable, database contract, or AI schema changes:

1. Open coordinated changes in every affected repository.
2. Update this Docs repository in the same delivery window.
3. Link the related pull requests to each other.
4. Merge provider changes before, or together with, consumers so the shared contract stays valid.

## Initial Publication Checklist

- Commit the prepared files in each repository.
- Push `main` and create `development`; retain `develop` only while existing integrations need it.
- Protect `main` and require each repository's CI check.
- Verify README and governance links in all six independent repositories.
- Mark the legacy monorepo read-only only after all five default branches and CI workflows exist.
