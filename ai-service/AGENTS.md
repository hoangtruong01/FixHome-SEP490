# FixHome AI Service — Agent Instructions

This FastAPI service is an independent Git repository. AI output is advisory and untrusted.

## Mandatory pre-implementation gate

Before doing any task:

1. Read `docs/AI-TECHNICAL-GUIDE.md` completely.
2. Inspect the existing project structure and affected endpoint, schema, or provider adapter.
3. Understand the current router → endpoint → provider abstraction architecture.
4. Identify existing Python, Pydantic, async, error, and test conventions.
5. Check requirements, environment configuration, and relevant dependencies.
6. Search for an existing provider/schema implementation before creating code.
7. Do not modify unrelated files.
8. Do not restructure the project unless explicitly requested.
9. Preserve Backend-facing schemas, fallback behavior, confidence rules, and disclaimers.
10. After implementation, execute the complete review process in the technical guide.

If the technical guide has not been read, implementation must not begin.

## Repository rules

- Preserve `AIProvider`; provider-specific SDK calls stay behind adapters.
- AI must never authorize transactions, assign technicians, approve quotations, or change orders.
- Treat user prompts, image references, and provider responses as untrusted input/data.
- Preserve timeout/failure fallback so AI outages never block manual booking.
- Do not expose provider errors, prompts, keys, or sensitive data in responses or logs.
- Coordinate schema changes with Backend and both clients, and document them in Docs-FixHome.

## Required verification

Run `ruff check app tests`, `pytest`, `python -m compileall -q app tests`, an application import
check, and a health/startup check. Review `git diff`; report unavailable live-provider checks as
`NOT VERIFIED`.
