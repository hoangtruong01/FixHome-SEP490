# Docs-FixHome AI Technical Guide

This is the mandatory governance document for every human or AI edit in this independent
documentation repository. Documentation claims require evidence and must remain consistent with
the owning source repositories.

## 1. Repository Purpose

Docs-FixHome owns approved cross-system requirements, actor definitions, project scope,
architecture, API/database contracts, deployment guidance, test plans, UML/assets, project status,
repository ownership, and engineering governance.

It does not own executable Backend, Web, Mobile, or AI application code. It must not invent product
scope, mark scaffolds as complete, or act as a substitute for tests/source evidence.

## 2. Technology Stack

- UTF-8 Markdown and fenced text/Mermaid-compatible diagrams
- PNG assets where a textual diagram is insufficient
- Node.js 20+ only for documentation QA
- markdownlint-cli2 with a repository policy in `.markdownlint-cli2.jsonc`
- A dependency-free Node validation script for local links and governance structure
- GitHub Actions for Markdown, link, and documentation validation

The QA toolchain supports documentation; it does not make this an application repository.

## 3. Existing Architecture

Information flows from approved business intent and implementation evidence into canonical docs:

```text
Stakeholder decision / requirement
  -> requirements and project scope
  -> architecture and repository ownership
  -> API + database contracts
  -> implementation in owning repository
  -> tests and validation evidence
  -> status/traceability updates
```

`PROJECT_DOCUMENTATION.md` is the project-level summary/source of truth.
`AI_DEVELOPMENT_WORKFLOW.md` defines the cross-role process. `CURRENT_TASKS.md` records status and
open decisions. `REPOSITORY_GUIDE.md` defines polyrepo ownership. Topic folders hold detail and must
not silently contradict those canonical documents.

FixHome has five active owning repositories plus the independent legacy migration snapshot
`FixHome-SEP490`. New feature work belongs to the appropriate active repository.

## 4. Folder Structure

- `requirements/`: approved scope, actors, and functional requirements.
- `architecture/`: system boundaries, flows, and lifecycle distinctions.
- `api/`: API contracts/specifications when created.
- `database/`: schema and naming/migration rules.
- `deployment/`: environments, release, operations, and rollback guidance.
- `testing/`: plans, cases, traceability, and evidence conventions.
- `uml/`: maintainable UML sources/exports.
- `assets/`: referenced images such as the project logo.
- `docs/`: repository-local AI technical governance.
- `scripts/`: deterministic documentation validation.
- `.github/workflows/`: independent Docs CI.
- Root canonical files: project truth, AI workflow, tasks, ownership, contributing, and agent rules.

## 5. Coding Rules

- Use one clear H1 per document, ordered headings, descriptive link text, fenced-code languages, and
  a final newline. Follow `.markdownlint-cli2.jsonc`.
- Use exact domain terms: Customer, Technician, Service Manager, Admin, Booking, Service Order,
  Quotation, and AI Diagnosis. Do not create synonyms that obscure contracts.
- Status labels are only `PLANNED`, `SCAFFOLDED`, `IMPLEMENTED`, `TESTED`, `VERIFIED`, `BLOCKED`.
- Link to existing canonical material rather than copying large sections that will drift. If a local
  detail repeats a contract, identify the canonical owner.
- Use relative links for repository-local content and validate moved/renamed targets. Do not rename
  or move documents broadly as part of an unrelated edit.
- Describe API fields/status values exactly as implemented/approved, including case and nullability.
- Separate decisions from proposals. Mark unresolved items `NEED CONFIRMATION` or `NEED DECISION`.
- Never place secrets, private customer data, real access tokens, or confidential provider content
  in examples or screenshots.
- Modify only affected documents and preserve valid architecture history/context.

## 6. Business Rules

- Actors are Customer, Technician, Service Manager, and Admin with responsibilities documented in
  `requirements/actors.md` and `PROJECT_DOCUMENTATION.md`.
- Backend-FixHome is authoritative for business logic, validation, JWT/RBAC, ownership, persistence,
  and state transitions. Web/Mobile are UI clients; AI is advisory only.
- Booking is a request/scheduling lifecycle; Service Order is repair execution. Never merge them.
- Service Order lifecycle is:

```text
PENDING_CONFIRMATION -> ACCEPTED | CANCELLED
ACCEPTED             -> EN_ROUTE | CANCELLED
EN_ROUTE             -> UNDER_REPAIR
UNDER_REPAIR         -> COMPLETED
COMPLETED/CANCELLED  -> terminal
```

- AI confidence/fallback/disclaimer behavior must allow manual Booking and may not make business
  decisions. Estimated AI cost is not a Quotation.
- Implementation status requires source evidence; TESTED/VERIFIED additionally require executed
  evidence. A file/module shell is only SCAFFOLDED.
- Approved changes to roles, enums, API, database, or state require coordinated documentation and
  pull requests across affected repositories.

## 7. Security Rules

- Document JWT, RBAC, resource ownership/IDOR controls, input validation, error handling, secrets,
  CORS, uploads, sensitive data, and AI safety where relevant.
- Never publish credentials, production host details that are confidential, personal data, raw logs,
  provider prompts/responses, or realistic secrets. Use clearly fake example values.
- Security claims must name the enforcement layer and evidence. A UI guard is never documented as
  server authorization.
- Upload requirements include MIME/content validation, size/count limits, authorization, safe names,
  storage isolation, and malware/content policy where appropriate.
- AI documentation treats prompts, URLs/images, and model output as untrusted and covers SSRF,
  prompt injection, timeout, data minimization, and error leakage.
- Do not recommend `synchronize: true` outside development or forced dependency upgrades without a
  migration/regression plan.

## 8. Testing Rules

- Documentation review covers accuracy, consistency, traceability, local links, formatting, and
  status evidence.
- For product behavior claims, inspect the owning source, tests, and most recent actual validation.
- Trace happy, negative, boundary, invalid-input, permission, error, regression, and Service Order
  transition cases where relevant.
- Link validation checks repository-local targets deterministically. External reachability remains a
  manual/release check because CI network/rate limits can be nondeterministic.
- Never turn `NOT VERIFIED` into `PASS`; identify why a check was unavailable.

## 9. CI/CD Rules

`.github/workflows/ci.yml` is independent and runs on pushes and pull requests targeting `main`,
`development`, or the retained `develop` alias:

```text
npm ci
npm run lint
npm run check:links
npm run validate
```

Markdown lint, missing local link targets, or missing governance structure fails CI. Do not use
`continue-on-error`. Publishing generated documentation requires a separate approved deployment job
that does not overwrite source or expose secrets.

## 10. AI Development Workflow

```text
Task
-> read this guide and all relevant canonical/topic documents
-> inspect owning repository source/tests for implementation claims
-> BA analysis: actor, requirement, inputs/outputs, rules, validation, permission, API/DB/state,
   edge cases, repositories affected
-> PM scope review: approved scope, necessity, open decisions, no invented feature
-> CTO/Tech Lead review: architecture/boundaries/contracts/backward compatibility
-> impact analysis and minimum documentation edit
-> Senior Developer review of technical accuracy
-> Security review
-> Tester review of cases/evidence
-> QA/QC consistency trace across requirement/architecture/DB/API/code/UI/tests/docs
-> Markdown/link/governance checks
-> git diff and unintended-change review
-> final architecture/status review
-> PASS, FAIL, or BLOCKED/NOT VERIFIED
```

If review reveals drift or a broken link, find the authoritative fact, fix all in-scope occurrences,
rerun checks, and review again. Final reporting includes Task, Repository, Analysis, Files Changed,
Implementation, role reviews, Technical Validation, Issues Found, Auto Fix, Remaining Issues, and
Final Status. Every check is `PASS`, `FAIL`, or `NOT VERIFIED` based only on actual evidence.
