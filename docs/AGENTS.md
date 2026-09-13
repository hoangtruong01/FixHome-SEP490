# FixHome Documentation — Agent Instructions

This independent repository is the cross-system source of truth for approved requirements,
architecture, contracts, testing, and governance.

## Mandatory pre-implementation gate

Before doing any task:

1. Read `docs/AI-TECHNICAL-GUIDE.md` completely.
2. Inspect the repository taxonomy and every document related to the requested subject.
3. Understand the documented system architecture and repository ownership boundaries.
4. Identify existing terminology, status labels, Markdown, diagram, and traceability conventions.
5. Check documentation tooling and related source-repository implementation evidence.
6. Search existing documents before creating a new source of truth.
7. Do not modify unrelated files.
8. Do not restructure the documentation unless explicitly requested.
9. Preserve approved API/database contracts and business rules; flag unresolved decisions.
10. After editing, execute the complete review process in the technical guide.

If the technical guide has not been read, editing must not begin.

## Repository rules

- Never describe scaffolding as implemented or an unexecuted check as passing.
- Use only `PLANNED`, `SCAFFOLDED`, `IMPLEMENTED`, `TESTED`, `VERIFIED`, or `BLOCKED` for status.
- Validate implementation claims against the owning repository and tests.
- Keep actors, enums, Service Order transitions, API, database, UI, security, and tests consistent.
- Record unresolved scope as `NEED CONFIRMATION`/`NEED DECISION`; do not invent requirements.
- New executable product code belongs in its owning repository, not here.

## Required verification

Run `npm run lint`, `npm run check:links`, and `npm run validate`. Review `git diff` and report
external-link reachability or source behavior not actually checked as `NOT VERIFIED`.
