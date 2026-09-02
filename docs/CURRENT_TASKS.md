# FixHome — Current Tasks

> Last updated: 2026-09-02 | Phase: Post-Setup Audit

---

## Current Phase

**Foundation Setup Complete** — Project scaffolding is in place. Ready to begin feature implementation starting with Authentication.

## Project Health

| Area | Status | Notes |
|------|--------|-------|
| Backend | ✅ Builds, Lint passes, 15 tests pass | Modules scaffolded, business logic not implemented |
| Web | ✅ TypeCheck passes, Build passes | Login + Dashboard shell only |
| Mobile | ✅ TypeCheck passes | Login + Home screens only |
| AI Service | ✅ 2 tests pass, compiles | Provider abstraction in place, skeleton responses |
| Database | ⚠️ Foundation fixed | data-source.ts created, migrations dir created, no migrations yet |
| Testing | ⚠️ Partial | Backend has Vitest; Web/Mobile have no test frameworks |
| Documentation | ✅ Governance docs created | PROJECT_DOCUMENTATION, AI_DEVELOPMENT_WORKFLOW, CURRENT_TASKS |
| CI | ✅ GitHub Actions configured | All 4 projects verified |

---

## In Progress

_No tasks currently in progress._

---

## TODO — Priority Order

### TASK-001: Implement Authentication (Login + Register)

- **Title**: Authentication — Login and Registration Endpoints
- **Requirement**: FR-AUTH-001
- **Actors**: All (Customer, Technician, Service Manager, Admin)
- **Priority**: CRITICAL
- **Status**: TODO

| Layer | Impact |
|-------|--------|
| Backend | AFFECTED — Implement AuthService (register, login, validateUser, generateToken, hashPassword) |
| Database | AFFECTED — User entity is defined, may need additional fields |
| API | AFFECTED — POST /auth/register, POST /auth/login, GET /auth/profile |
| Web | AFFECTED — Connect LoginPage to real API, implement register page |
| Mobile | AFFECTED — Connect LoginScreen to real API |
| AI | NOT AFFECTED |
| Security | AFFECTED — JWT generation, password hashing with bcrypt |
| Testing | AFFECTED — Auth service unit tests, controller tests, guard tests |

- **Dependencies**: None (foundation task)
- **Blockers**: None
- **Remaining Work**: Full implementation required

---

### TASK-002: Define Core Database Entities

- **Title**: Create TypeORM Entities for Core Modules
- **Requirement**: All FR-*
- **Actors**: N/A (infrastructure)
- **Priority**: CRITICAL
- **Status**: TODO

| Layer | Impact |
|-------|--------|
| Backend | AFFECTED — Create entity files in each module |
| Database | AFFECTED — Define tables: technicians, services, categories, bookings, service_orders, quotations, reviews, notifications, media, service_areas |
| API | NOT AFFECTED (yet) |
| Web | NOT AFFECTED (yet) |
| Mobile | NOT AFFECTED (yet) |
| AI | NOT AFFECTED |
| Security | NOT AFFECTED |
| Testing | AFFECTED — Entity validation tests |

- **Dependencies**: TASK-001 (User entity should be finalized first)
- **Blockers**: None
- **Remaining Work**: Design and create all entity definitions with proper relations

---

### TASK-003: Create Initial Database Migration

- **Title**: Generate and Run First Migration
- **Requirement**: Infrastructure
- **Actors**: N/A
- **Priority**: CRITICAL
- **Status**: TODO

| Layer | Impact |
|-------|--------|
| Backend | AFFECTED — Generate migration from entities |
| Database | AFFECTED — Create tables in PostgreSQL |

- **Dependencies**: TASK-002
- **Blockers**: None
- **Remaining Work**: Generate migration after entities are defined, verify it runs cleanly

---

### TASK-004: Implement Service Catalog (Categories + Services)

- **Title**: CRUD for Service Categories and Services
- **Requirement**: FR-SERVICE-001, FR-SERVICE-002
- **Actors**: Admin (manage), All (view)
- **Priority**: HIGH
- **Status**: TODO

| Layer | Impact |
|-------|--------|
| Backend | AFFECTED — Implement CategoriesService, ServicesService with CRUD |
| Database | AFFECTED — categories, services tables |
| API | AFFECTED — GET/POST/PATCH/DELETE endpoints |
| Web | AFFECTED — Admin catalog management pages |
| Mobile | AFFECTED — Customer service browsing |
| AI | NOT AFFECTED |
| Security | AFFECTED — RBAC (Admin for write, public for read) |
| Testing | AFFECTED |

- **Dependencies**: TASK-001, TASK-002, TASK-003
- **Blockers**: None

---

### TASK-005: Implement User Management

- **Title**: User Profile and Admin User Management
- **Requirement**: FR-USER-001
- **Actors**: Customer (own profile), Admin (all users)
- **Priority**: HIGH
- **Status**: TODO

- **Dependencies**: TASK-001

---

### TASK-006: Implement Technician Management + Verification

- **Title**: Technician Profiles and Admin Verification
- **Requirement**: FR-TECH-001, FR-TECH-002
- **Actors**: Admin, Technician
- **Priority**: HIGH
- **Status**: TODO

- **Dependencies**: TASK-001, TASK-002

---

### TASK-007: Implement Booking Module

- **Title**: Customer Booking Creation and Management
- **Requirement**: FR-BOOK-001
- **Actors**: Customer, Service Manager
- **Priority**: HIGH
- **Status**: TODO

- **Dependencies**: TASK-001, TASK-004

---

### TASK-008: Implement Service Order Module

- **Title**: Service Order CRUD with State Machine Integration
- **Requirement**: FR-ORDER-001
- **Actors**: All
- **Priority**: HIGH
- **Status**: TODO

- **Dependencies**: TASK-007, State Machine (already implemented)

---

### TASK-009: Implement AI Diagnosis — Full Provider Integration

- **Title**: Connect Gemini/OpenAI Providers with Real API Calls
- **Requirement**: FR-AI-001
- **Actors**: Customer
- **Priority**: MEDIUM
- **Status**: TODO

- **Dependencies**: TASK-001 (need authenticated users)
- **Notes**: Provider abstraction already in place; need to implement actual Gemini/OpenAI API calls

---

### TASK-010: Implement Quotation Module

- **Title**: Quotation Creation, Approval, Rejection
- **Requirement**: FR-QUOTE-001
- **Actors**: Technician (create), Customer (approve/reject)
- **Priority**: MEDIUM
- **Status**: TODO

- **Dependencies**: TASK-008

---

### TASK-011: Implement Technician Assignment

- **Title**: Manual and AI-Recommended Technician Assignment
- **Requirement**: FR-ASSIGN-001, FR-ASSIGN-002
- **Actors**: Service Manager
- **Priority**: MEDIUM
- **Status**: TODO

- **Dependencies**: TASK-006, TASK-008

---

### TASK-012: Implement Notifications

- **Title**: In-App Notification System
- **Requirement**: FR-NOTIFY-001
- **Actors**: All
- **Priority**: MEDIUM
- **Status**: TODO

- **Dependencies**: TASK-008

---

### TASK-013: Implement Reviews & Ratings

- **Title**: Post-Service Customer Reviews
- **Requirement**: FR-REVIEW-001
- **Actors**: Customer
- **Priority**: MEDIUM
- **Status**: TODO

- **Dependencies**: TASK-008

---

### TASK-014: Implement Media Upload (Repair Evidence)

- **Title**: Image Upload for Issue Reports and Repair Evidence
- **Requirement**: FR-MEDIA-001
- **Actors**: Customer, Technician
- **Priority**: MEDIUM
- **Status**: TODO

- **Dependencies**: TASK-001, Cloudinary/Firebase configuration

---

### TASK-015: Implement Dashboard

- **Title**: Admin and Manager Dashboard with Statistics
- **Requirement**: FR-DASH-001
- **Actors**: Admin, Service Manager
- **Priority**: LOW
- **Status**: TODO

- **Dependencies**: TASK-008 (need data to display)

---

### TASK-016: Implement Service Areas / Maps

- **Title**: Service Area Management and Google Maps Integration
- **Requirement**: FR-MAP-001
- **Actors**: Admin
- **Priority**: LOW
- **Status**: TODO

- **Dependencies**: Google Maps API key configuration

---

### TASK-017: Setup Web Lint and Testing Framework

- **Title**: Configure ESLint/OxLint and Vitest for Vue.js Web Project
- **Requirement**: Infrastructure
- **Priority**: MEDIUM
- **Status**: TODO

- **Notes**: Currently no lint or test framework in web project

---

### TASK-018: Setup Mobile Lint and Testing Framework

- **Title**: Configure Lint and Jest/Testing Library for React Native
- **Requirement**: Infrastructure
- **Priority**: MEDIUM
- **Status**: TODO

- **Notes**: Currently no lint or test framework in mobile project

---

## Blocked

_No tasks currently blocked._

---

## Recently Completed

### SETUP-001: Project Audit, Documentation & Governance Setup

- **Completed**: 2026-09-02
- **Summary**:
  - Full repository audit (Backend, Web, Mobile, AI, DB, CI, Docs)
  - Created `AGENTS.md` (root governance)
  - Created `docs/PROJECT_DOCUMENTATION.md` (Single Source of Truth)
  - Created `docs/AI_DEVELOPMENT_WORKFLOW.md` (mandatory workflow)
  - Created `docs/CURRENT_TASKS.md` (this file)
  - Fixed: Missing `data-source.ts` for migration CLI
  - Fixed: Missing `migrations/` directory
  - Verified: All builds pass, all existing tests pass
  - Verified: `.env` files not tracked by git

---

## Open Business Decisions

| ID | Question | Impact | Status |
|----|----------|--------|--------|
| OBD-001 | Online payment / e-wallet integration scope? | Booking flow, Service Order completion | NEED CONFIRMATION |
| OBD-002 | Live GPS tracking vs. status-based tracking? | Mobile, Backend, Realtime requirements | NEED CONFIRMATION |
| OBD-003 | When can Technician update quotation? Does approved quotation become immutable? | Quotation module design | NEED DECISION |
| OBD-004 | Exact additional cost approval flow? | Quotation + Service Order modules | NEED DECISION |
| OBD-005 | Notification delivery method — push, in-app, email, or combination? | Notification module design | NEED DECISION |
| OBD-006 | Exact scope of map functionality — area management only or address autocomplete? | Service Areas module | NEED DECISION |
