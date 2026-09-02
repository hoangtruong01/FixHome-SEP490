# FixHome — AI Development Workflow

> **Mandatory workflow for all engineering tasks on the FixHome project.**
> Every AI Coding Agent and developer must follow these steps.

---

## Overview

Every feature, bug fix, or refactor task must be analyzed through **13 expert perspectives** and executed through **13 mandatory steps**. This does not mean every task modifies all layers — but every layer must be **checked** and documented as either `AFFECTED` or `NOT AFFECTED — <reason>`.

### Expert Perspectives

1. Senior Business Analyst
2. PM / Project Analyst
3. Software Architect
4. Database Engineer
5. Backend Engineer (NestJS)
6. Web Frontend Engineer (Vue.js)
7. Mobile Engineer (React Native / Expo)
8. AI Engineer (FastAPI / LLM)
9. Information Security Engineer
10. Testing Engineer
11. QA/QC Lead
12. UAT Specialist
13. Technical Writer

---

## Step 1 — Context Analysis

**Before writing any code**, read and understand:

- [ ] Task description and requirements
- [ ] `docs/PROJECT_DOCUMENTATION.md` — relevant sections
- [ ] `docs/CURRENT_TASKS.md` — related or dependent tasks
- [ ] Related source code (entities, DTOs, services, controllers)
- [ ] Related API contracts (endpoints, request/response)
- [ ] Related tests
- [ ] Related UI callers (Web pages, Mobile screens)

**Rule**: Do not code before understanding context.

---

## Step 2 — Business Analysis (BA)

The Business Analyst must identify:

| Item | Description |
|------|-------------|
| **Business Objective** | Why does this feature exist? |
| **Actors** | Which actors use this feature? |
| **Trigger** | What starts this flow? |
| **Preconditions** | What must be true before execution? |
| **Input** | What data is needed? |
| **Output** | What is the expected result? |
| **Main Flow** | Happy path steps |
| **Alternative Flow** | Alternate paths |
| **Exception Flow** | Error paths |
| **Business Rules** | Constraints and validation rules |
| **Validation** | Input validation requirements |
| **Permission** | Which roles are allowed? |
| **Ownership** | Does resource ownership apply? |
| **State Impact** | Does this affect Booking/Order status? |
| **Acceptance Criteria** | Clear, testable criteria for DONE |

**Rule**: Do not invent business requirements. If unclear, mark as `OPEN BUSINESS DECISION`.

---

## Step 3 — PM / Project Analysis

| Item | Description |
|------|-------------|
| **In Scope** | What this task does |
| **Out of Scope** | What this task does NOT do |
| **Priority** | CRITICAL / HIGH / MEDIUM / LOW |
| **Dependencies** | What must be done first? |
| **Blockers** | Is anything blocking this? |
| **Risks** | Business or technical risks |
| **Capstone Feasibility** | Is this over-engineered for a student project? |

**Rule**: Prefer simple, implementable solutions. FixHome is a Capstone project.

---

## Step 4 — Architecture Impact Assessment

Check every layer and mark as AFFECTED or NOT AFFECTED with reason:

| Layer | Impact | Reason |
|-------|--------|--------|
| Backend | AFFECTED / NOT AFFECTED | |
| Database | AFFECTED / NOT AFFECTED | |
| API Contract | AFFECTED / NOT AFFECTED | |
| Web | AFFECTED / NOT AFFECTED | |
| Mobile | AFFECTED / NOT AFFECTED | |
| AI Service | AFFECTED / NOT AFFECTED | |
| Security | AFFECTED / NOT AFFECTED | |
| Realtime | AFFECTED / NOT AFFECTED | |
| Testing | AFFECTED | (always) |
| Documentation | AFFECTED | (always) |

---

## Step 5 — Contract Analysis

### API Contract (if AFFECTED)
- Endpoint, HTTP method
- Actor and RBAC requirements
- Request body / query / path params
- Response schema
- Error codes and responses

### Database Contract (if AFFECTED)
- Table/entity changes
- Fields, types, constraints (PK, FK, nullable, unique, indexes)
- Migration plan
- Transaction requirements

### State Contract (if Service Order or Booking status is AFFECTED)
- Current state → allowed next states
- Which actors can trigger each transition
- Rejection cases

### UI Contract — Web (if AFFECTED)
- Route, page, component
- Pinia store changes
- API caller
- UI states: loading, empty, error, permission denied

### UI Contract — Mobile (if AFFECTED)
- Navigation route, screen
- Zustand store changes
- API caller
- UI states: loading, network failure, unauthorized

### AI Contract (if AFFECTED)
- Input/output schema
- Confidence handling
- Timeout and fallback
- Provider abstraction

---

## Step 6 — Security Review

| Check | Question |
|-------|----------|
| **Authentication** | Is JWT required? Or is this a public endpoint? |
| **Authorization** | Which roles are permitted? |
| **Resource Ownership** | Can User A access User B's resources? |
| **IDOR** | Can changing an ID in the URL expose another user's data? |
| **Input Validation** | Are all DTO fields validated with class-validator? |
| **File Upload** | MIME type, extension, max size validated? |
| **Secrets** | No hardcoded JWT_SECRET, DB password, API keys? |
| **Injection** | SQL injection, NoSQL injection prevented? |
| **AI Input** | User text/images treated as untrusted? |
| **AI Output** | AI responses treated as untrusted data? |
| **Error Leakage** | No DB errors, stack traces, or secrets in responses? |

**Rule**: AI output must never directly approve quotations, change order state, or authorize actions.

---

## Step 7 — Implementation Plan

Before coding, list:

- [ ] Files to Create
- [ ] Files to Modify
- [ ] Files to Remove (with justification)
- [ ] Database Migration needed?
- [ ] Backend changes
- [ ] API contract changes
- [ ] Web changes
- [ ] Mobile changes
- [ ] AI changes
- [ ] Security changes
- [ ] Tests to add
- [ ] Documentation to update

---

## Step 8 — Development

### Backend Rules
- Backend owns all business logic, validation, RBAC, state machine, and transactions
- Use existing patterns (module/controller/service/entity/DTO)
- Do not push business logic to Web or Mobile

### Web Rules
- Do not duplicate backend business rules
- UI responsibility: display, collect input, call API, handle states
- Use Pinia for global state, composables for reusable logic

### Mobile Rules
- Must use the **same Backend API contract** as Web
- Do not create workaround APIs
- Use Zustand for state, React Navigation for routing

### AI Service Rules
- AI is advisory only — no transaction control
- All responses must include confidence and disclaimer
- Fallback must always be available

---

## Step 9 — Developer Self Review

Before testing, verify:

- [ ] Logic correctness
- [ ] Type safety (no `any` unless justified)
- [ ] Null/undefined handling
- [ ] Exception/error handling
- [ ] DTO validation completeness
- [ ] RBAC applied correctly
- [ ] Resource ownership checked
- [ ] State transitions validated (if applicable)
- [ ] Transactions used for multi-write operations
- [ ] No duplicate logic across layers
- [ ] API response consistent with contract
- [ ] Web compatibility verified
- [ ] Mobile compatibility verified
- [ ] AI fallback tested
- [ ] No regression risk

---

## Step 10 — Testing

### Rules
- Only use these status labels: `PASS`, `FAIL`, `NOT VERIFIED`
- `PASS` = test was actually executed and succeeded
- `FAIL` = test was actually executed and failed
- `NOT VERIFIED` = test was NOT executed (must provide reason)
- **Never claim PASS based on "code looks correct"**

### Backend Testing Checklist
- [ ] Lint (oxlint)
- [ ] Build (nest build)
- [ ] Unit tests (vitest)
- [ ] State machine tests (if applicable)
- [ ] Service logic tests
- [ ] Controller tests
- [ ] Validation tests (DTO)
- [ ] RBAC tests
- [ ] Ownership tests
- [ ] Negative/error tests

### Web Testing Checklist
- [ ] TypeScript check (vue-tsc)
- [ ] Build (vite build)
- [ ] Lint (when configured)
- [ ] Component tests (when configured)
- [ ] Store tests (when configured)

### Mobile Testing Checklist
- [ ] TypeScript check (tsc --noEmit)
- [ ] Lint (when configured)
- [ ] Store tests (when configured)
- [ ] Navigation validation
- [ ] Expo smoke test (when environment supports)

### AI Service Testing Checklist
- [ ] pytest
- [ ] Health check test
- [ ] Schema validation test
- [ ] Provider abstraction test
- [ ] Invalid input test
- [ ] Timeout/fallback test

### Cross-System Contract Test
Verify that Backend DTOs, Web API types, and Mobile API types are **consistent**:
- Same field names (or documented mapping)
- Same enum values
- Same response structure

---

## Step 11 — QA/QC Review

QA/QC verifies the chain:

```
Requirement → Acceptance Criteria → Implementation → Database → API → Web/Mobile → Test
```

Check:
- [ ] Acceptance Criteria coverage
- [ ] Business rule correctness
- [ ] Boundary cases handled
- [ ] Error responses consistent
- [ ] Data integrity maintained
- [ ] No regression introduced
- [ ] No duplicate logic
- [ ] No missing permissions
- [ ] No scope creep

---

## Step 12 — UAT Simulation

Simulate User Acceptance Testing using Given-When-Then format:

```
Scenario: <description>

Given:
  <preconditions>

When:
  <user action>

Then:
  <expected outcome>

And:
  <additional assertions>
```

**Rules**:
- Simulate UAT for each relevant actor
- Label as `UAT SIMULATION` — not "Real UAT PASS"
- Real UAT can only be marked by a human tester

---

## Step 13 — Documentation & Traceability

After implementation, update:

- [ ] `docs/PROJECT_DOCUMENTATION.md` — if architecture, requirements, API, database, state, RBAC, or workflow changed
- [ ] `docs/CURRENT_TASKS.md` — mark completed tasks, add new tasks
- [ ] Feature Traceability Matrix — update status
- [ ] Inline code documentation (JSDoc, comments) if needed

**Rule**: Do not mark documentation as "Implemented" if code is not actually implemented.

---

## Definition of Ready

A task is **Ready** when all of these are identified:
- Requirement and objective
- Actor(s) involved
- Acceptance Criteria
- Business rules and permissions
- Impact on: API, DB, Web, Mobile, AI, Security
- Dependencies and blockers

If information is missing but can be reasonably inferred: document as `ASSUMPTION: <details>`.
If a business decision is needed: mark as `OPEN BUSINESS DECISION: <question>`.

---

## Definition of Done

A task is **Done** when all applicable items are complete:

- [ ] BA analysis completed
- [ ] Scope validated (no scope creep)
- [ ] Architecture impact checked
- [ ] API contract verified
- [ ] Database changes migrated
- [ ] Backend implementation complete
- [ ] Web implementation complete (or NOT AFFECTED)
- [ ] Mobile implementation complete (or NOT AFFECTED)
- [ ] AI changes complete (or NOT AFFECTED)
- [ ] Security reviewed
- [ ] Tests executed (PASS/FAIL/NOT VERIFIED)
- [ ] QA/QC reviewed
- [ ] UAT simulated
- [ ] Documentation updated
- [ ] CURRENT_TASKS updated

---

## Issue Severity Classification

| Severity | Definition | Example |
|----------|-----------|---------|
| **CRITICAL** | Project cannot run or has data/security risk | Won't compile, migration broken, JWT bypass, secrets committed |
| **HIGH** | Directly impacts development consistency | Contract mismatch between Web/Mobile/Backend, missing RBAC, wrong DB relation |
| **MEDIUM** | Needs fixing but doesn't block development | Missing unit tests, incomplete docs, inconsistent error format |
| **LOW** | Cleanup / maintainability | Code style, naming, minor optimizations |
