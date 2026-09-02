<p align="center">
  <img src="assets/logo.png" alt="FixHome Logo" width="140" />
</p>

# FixHome — Project Documentation

> **Single Source of Truth** for the FixHome Capstone Project.
> Last updated: 2026-09-02 | Status: Initial Setup Complete

---

## 1. Project Overview

**FixHome** is a Web + Mobile platform for booking home repair and maintenance services. It connects Customers with verified Technicians, assisted by AI-powered fault diagnosis. The system manages the full service lifecycle: Issue → Diagnosis → Booking → Technician Assignment → Service Order → Quotation → Repair → Completion → Review.

## 2. Problem Statement

Homeowners face difficulty finding reliable, verified repair technicians. Existing solutions lack transparency in pricing, scheduling, and service quality. FixHome addresses this by providing a structured booking platform with AI-assisted diagnosis, standardized workflows, and quality assurance through ratings.

## 3. Objectives

- Enable Customers to easily book home repair services via Mobile/Web
- Provide AI-assisted preliminary fault diagnosis from photos and descriptions
- Manage the complete repair lifecycle with transparent status tracking
- Facilitate fair technician assignment based on skills, location, and ratings
- Ensure service quality through structured quotation and review workflows

## 4. Actors

| Actor | Platform | Description |
|-------|----------|-------------|
| **Customer** | Mobile App, Web | End user who needs home repair/maintenance services |
| **Technician** | Mobile App | Verified professional who performs repair work |
| **Service Manager** | Web Admin Portal | Operations staff who manages bookings and dispatches technicians |
| **Admin** | Web Admin Portal | System administrator managing users, services, and configuration |

## 5. Actor Responsibility Matrix

### Customer
- Register / Login
- Manage personal profile
- Browse service catalog
- Submit issue photos and descriptions for AI Diagnosis
- Create Bookings (select service, time, address)
- Track Booking and Service Order status
- View and approve/reject Quotations
- Approve/reject additional costs when applicable
- Receive notifications
- View repair history
- Rate and review Technicians after service completion

### Technician
- Login
- Manage technician profile
- View assigned work
- Accept tasks per business rules
- Update Service Order status (ACCEPTED → EN_ROUTE → UNDER_REPAIR → COMPLETED)
- Create/update Quotation when permitted
- Submit repair evidence (photos)
- Complete repair workflow

### Service Manager
- Manage and review Bookings
- Check technician availability
- Assign / reassign Technicians (with AI recommendation support)
- Handle operational exceptions
- Monitor active Service Orders
- Manage service operations per permission scope

### Admin
- Manage all user accounts
- Manage Technician profiles and verification
- Manage service catalog and categories
- Manage service areas configuration
- Administrative system configuration
- View dashboard and reports
- Review moderation (if within approved scope)

## 6. Project Scope

### In Scope
- User management and authentication (JWT + RBAC)
- Service catalog and category management
- AI-powered fault diagnosis (advisory only)
- Booking management
- Service Order lifecycle (State Machine)
- Quotation creation and approval
- Technician recommendation and assignment
- Notifications (status changes, new assignments)
- Ratings and reviews
- Repair history (queried from completed Service Orders)
- Dashboard and reporting
- Service areas / maps

### Out of Scope
- [NEED CONFIRMATION] Online payment / e-wallet integration
- [NEED CONFIRMATION] Live GPS tracking (current scope uses status-based tracking + map)
- IoT / smart home hardware integration
- Multi-language support (beyond Vietnamese)
- Third-party marketplace integration

## 7. Core Modules

| # | Module | Status | Backend | Web | Mobile |
|---|--------|--------|---------|-----|--------|
| 1 | Authentication + JWT + RBAC | SCAFFOLDED | ✅ Guards, Strategy, Decorators | ✅ Auth store, guard | ✅ Auth store, SecureStore |
| 2 | User Management | SCAFFOLDED | Module exists, no endpoints | — | — |
| 3 | Technician Management | SCAFFOLDED | Module exists, no endpoints | — | — |
| 4 | Technician Verification | PLANNED | — | — | — |
| 5 | Service Catalog | SCAFFOLDED | Module exists, no endpoints | — | — |
| 6 | Categories | SCAFFOLDED | Module exists, no endpoints | — | — |
| 7 | AI Diagnosis | SCAFFOLDED | ✅ Controller, Service, DTOs | — | — |
| 8 | Booking | SCAFFOLDED | Module exists, no endpoints | — | — |
| 9 | Service Order | SCAFFOLDED | Module exists, State Machine ✅ | — | — |
| 10 | Service Order State Machine | IMPLEMENTED + TESTED | ✅ 15 tests passing | — | — |
| 11 | Quotation | SCAFFOLDED | Module exists, no endpoints | — | — |
| 12 | Additional Cost Approval | PLANNED | — | — | — |
| 13 | Technician Recommendation | PLANNED | — | — | — |
| 14 | Technician Assignment | SCAFFOLDED | Module exists, no endpoints | — | — |
| 15 | Notifications | SCAFFOLDED | Module exists, no endpoints | — | — |
| 16 | Ratings & Reviews | SCAFFOLDED | Module exists, no endpoints | — | — |
| 17 | Repair History | PLANNED | Query from completed Service Orders | — | — |
| 18 | Media / Repair Evidence | SCAFFOLDED | Module exists, no endpoints | — | — |
| 19 | Dashboard | SCAFFOLDED | Module exists, no endpoints | ✅ Page shell | — |
| 20 | Maps / Service Areas | SCAFFOLDED | Module exists, no endpoints | — | — |
| 21 | Health Check | IMPLEMENTED | ✅ DB + AI health | — | — |

> **Important**: "SCAFFOLDED" means the NestJS module, controller, and service files exist but contain **no business logic** — only placeholder TODO comments.

## 8. System Architecture

```
Web (Vue.js) ──────┐
                    │
Mobile (Expo) ─────┼──► NestJS Backend API ──► PostgreSQL
                    │
                    └──► FastAPI AI Service ──► Gemini / OpenAI
```

### Architecture Principles
- Web and Mobile are **UI clients only** — they call the Backend API
- NestJS Backend is the **authoritative business layer** for all logic, validation, RBAC, and state management
- AI Service is **advisory only** — it provides diagnosis suggestions but does not control business transactions
- Web and Mobile **never call Gemini/OpenAI directly**

### Actor Platform Mapping
| Actor | Primary Platform |
|-------|-----------------|
| Customer | Mobile App (also Web) |
| Technician | Mobile App |
| Service Manager | Web Admin Portal |
| Admin | Web Admin Portal |

## 9. Backend Architecture

- **Framework**: NestJS 10 with TypeScript
- **ORM**: TypeORM with PostgreSQL
- **Testing**: Vitest
- **Linting**: OxLint
- **API Docs**: Swagger (OpenAPI) at `/api/docs`
- **Global Prefix**: `/api/v1`
- **Security**: Helmet, CORS, ValidationPipe (whitelist + transform + forbidNonWhitelisted)
- **Response Format**: Standardized via `TransformInterceptor` wrapping all responses in `{ statusCode, message, data }`
- **Error Format**: Standardized via `HttpExceptionFilter` producing `{ statusCode, message, errors?, timestamp, path }`
- **Modules**: 16 feature modules organized under `src/modules/`

## 10. Web Architecture

- **Framework**: Vue.js 3 with Composition API (`<script setup>`)
- **Build Tool**: Vite 8
- **Styling**: TailwindCSS 4
- **State Management**: Pinia
- **Routing**: Vue Router with auth guards
- **API Client**: Axios with JWT interceptor
- **TypeScript**: Strict mode via vue-tsc
- **Current Pages**: Login, Dashboard (shell), 404

## 11. Mobile Architecture

- **Framework**: React Native with Expo SDK 57
- **Navigation**: React Navigation (native-stack + bottom-tabs)
- **State Management**: Zustand
- **API Client**: Axios with JWT interceptor
- **Secure Storage**: expo-secure-store (not localStorage)
- **Current Screens**: Login, Customer Home, Technician Home
- **Role-based Navigation**: Separate navigators for Customer and Technician flows

## 12. AI Architecture

- **Framework**: FastAPI (Python)
- **Provider Abstraction**: Abstract `AIProvider` base class with `GeminiProvider`, `OpenAIProvider`, and `MockAIProvider`
- **Configurable**: `AI_PROVIDER` env var selects provider (`gemini`, `openai`, `mock`)
- **Schemas**: Pydantic models with camelCase aliases for JSON API compatibility
- **Error Handling**: Custom `AIServiceException` hierarchy with structured error responses
- **Confidence Threshold**: Configurable via `AI_CONFIDENCE_THRESHOLD` (default 0.6)
- **Disclaimer**: All responses include advisory disclaimer
- **Tests**: Health check test + provider abstraction contract test

## 13. Database Architecture

- **DBMS**: PostgreSQL 16 (Docker container)
- **ORM**: TypeORM
- **UUID Extension**: Enabled via `docker/postgres/init.sql`
- **Base Entity**: All entities extend `BaseEntity` (UUID `id`, `created_at`, `updated_at`)
- **Naming**: snake_case tables (plural), snake_case columns, `<entity>_id` foreign keys
- **Migrations**: TypeORM migration system; `data-source.ts` for CLI commands
- **Synchronize**: Enabled only in `development` environment; **never in production**

### Current Entities
| Entity | Table | Status |
|--------|-------|--------|
| User | `users` | SCAFFOLDED (basic fields: email, password_hash, full_name, phone_number, role, is_active) |

> Most modules have `.gitkeep` placeholder in their `entities/` directory. Entity definitions are needed before business logic implementation.

## 14. Authentication

- **Strategy**: JWT (Bearer token via Authorization header)
- **Implementation**: Passport.js + `@nestjs/jwt` + `@nestjs/passport`
- **JWT Payload**: `{ sub: userId, email, role }`
- **Guards**: `JwtAuthGuard` (authentication), `RolesGuard` (authorization)
- **Decorators**: `@Roles(Role.CUSTOMER, ...)` and `@CurrentUser()`
- **Token Storage**:
  - Web: `localStorage` (access_token key)
  - Mobile: `expo-secure-store` (encrypted native storage)
- **Status**: SCAFFOLDED — Guard infrastructure exists, login/register endpoints not yet implemented

## 15. Authorization / RBAC

| Role | Value | Description |
|------|-------|-------------|
| Customer | `customer` | End user booking services |
| Technician | `technician` | Repair professional |
| Service Manager | `service_manager` | Operations coordinator |
| Admin | `admin` | System administrator |

- Roles are defined in `src/shared/enums/role.enum.ts`
- `RolesGuard` reads `@Roles()` decorator metadata
- Role values are consistent across Backend enum, Web `UserRole` enum, and Mobile `UserRole` enum

## 16. Service Catalog

- **Status**: SCAFFOLDED
- Categories and Services modules exist but have no entities or endpoints
- Expected to support hierarchical categories (e.g., Electrical → Wiring, Lighting)

## 17. AI Diagnosis Flow

```
Customer (Mobile/Web)
    │
    ├── description (text)
    ├── imageUrl (optional)
    └── categoryHint (optional)
    │
    ▼
NestJS Backend ── POST /api/v1/ai-diagnosis/analyze
    │
    ▼
FastAPI AI Service ── POST /api/v1/diagnosis/analyze
    │
    ├── AI Provider (Gemini/OpenAI/Mock)
    │
    ▼
DiagnosisResponse {
    possibleIssues: string[]
    possibleCauses: string[]
    urgency: LOW | MEDIUM | HIGH
    estimatedCost: { min, max, currency }
    suggestedActions: string[]
    recommendedServiceId: string | null
    confidence: 0.0 - 1.0
    isLowConfidence: boolean
    disclaimer: string
}
```

### AI Safety Rules
- AI is **advisory only** — results are suggestions, not definitive conclusions
- **Low confidence** (< threshold): `isLowConfidence: true` flag is set
- **AI failure**: Graceful fallback allowing customer to continue booking manually
- AI failure must **never block** the core booking workflow
- AI output is **untrusted data** — must not be used to directly approve business transactions

### AI Error Codes
`AI_PROVIDER_UNAVAILABLE`, `AI_TIMEOUT`, `AI_RATE_LIMIT`, `INVALID_IMAGE`, `UNSUPPORTED_IMAGE`, `INSUFFICIENT_INFORMATION`, `LOW_CONFIDENCE`, `AI_PROVIDER_ERROR`

## 18. Booking Flow

- **Status**: SCAFFOLDED (module exists, no implementation)
- **Expected Flow**:
  1. Customer selects service, time, and address
  2. Customer optionally attaches AI diagnosis result
  3. Booking is created with `PENDING` status
  4. Service Manager reviews and confirms
  5. Booking is confirmed → triggers Technician Assignment → Service Order creation

### Booking Status (Expected)
`PENDING` → `CONFIRMED` → `CANCELLED`

> **Note**: Booking status and Service Order status are separate lifecycles. They must not be mixed.

## 19. Booking vs Service Order

| Aspect | Booking | Service Order |
|--------|---------|---------------|
| **Purpose** | Customer request + scheduling | Repair execution lifecycle |
| **Creator** | Customer | System / Service Manager |
| **Key Data** | Service, time, address, description, AI result | Technician, status, quotation, evidence, timestamps |
| **Status** | PENDING, CONFIRMED, CANCELLED | PENDING_CONFIRMATION, ACCEPTED, EN_ROUTE, UNDER_REPAIR, COMPLETED, CANCELLED |

```
Customer creates Booking
        ↓
Booking validated / confirmed
        ↓
Technician assigned
        ↓
Service Order created
        ↓
Repair execution (State Machine)
        ↓
Completion + Review
```

## 20. Service Order State Machine

### Status Values
| Status | Description |
|--------|-------------|
| `PENDING_CONFIRMATION` | Order created, waiting for confirmation/acceptance |
| `ACCEPTED` | Confirmed and assigned, technician ready |
| `EN_ROUTE` | Technician traveling to location |
| `UNDER_REPAIR` | Repair work in progress |
| `COMPLETED` | Repair finished (terminal) |
| `CANCELLED` | Order cancelled (terminal) |

### Valid Transitions
```
PENDING_CONFIRMATION → ACCEPTED | CANCELLED
ACCEPTED → EN_ROUTE | CANCELLED
EN_ROUTE → UNDER_REPAIR
UNDER_REPAIR → COMPLETED
COMPLETED → (terminal)
CANCELLED → (terminal)
```

### Role-based Transition Permissions
| Current Status | Customer Can | Technician Can | Service Manager Can | Admin Can |
|---------------|-------------|----------------|--------------------|----|
| PENDING_CONFIRMATION | Cancel | — | Accept, Cancel | Accept, Cancel |
| ACCEPTED | Cancel | → EN_ROUTE | → EN_ROUTE, Cancel | → EN_ROUTE, Cancel |
| EN_ROUTE | — | → UNDER_REPAIR | → UNDER_REPAIR | → UNDER_REPAIR |
| UNDER_REPAIR | — | → COMPLETED | → COMPLETED | → COMPLETED |

### Implementation Status
- **State Machine class**: ✅ IMPLEMENTED + TESTED (15 tests, all passing)
- **Integration with Service Orders service**: ❌ NOT YET (service is placeholder)

## 21. Technician Recommendation

- **Status**: PLANNED
- AI may suggest technicians based on: specialization, rating, proximity, availability
- AI recommendation is **advisory** — assignment must be a business action through Backend

## 22. Technician Assignment

- **Status**: SCAFFOLDED (module exists, no implementation)
- Service Manager assigns technician to Service Order
- Must distinguish: AI **recommends** vs. system **assigns**
- Assignment module has planned endpoints: assign, reassign, suggestions

## 23. Quotation Flow

- **Status**: SCAFFOLDED (module exists, no implementation)
- **Expected Flow**:
  1. Technician creates quotation after on-site inspection
  2. Quotation details: labor cost, parts, total
  3. Customer reviews and approves/rejects
  4. Approved quotation may become immutable
- **OPEN BUSINESS DECISION**: When can technician update quotation? Does approved quotation become immutable?

## 24. Additional Cost Approval

- **Status**: PLANNED
- If additional costs are discovered during repair, explicit Customer approval is required
- Technician cannot unilaterally add costs
- **OPEN BUSINESS DECISION**: Exact approval flow, status tracking, relationship with order state

## 25. Repair Evidence

- **Status**: SCAFFOLDED (Media module exists, no implementation)
- Technicians submit photos as proof of completed work
- Storage: Cloudinary or Firebase Storage (configured via environment)
- Upload validation required: MIME type, file size, supported formats

## 26. Notifications

- **Status**: SCAFFOLDED (module exists, no implementation)
- Expected triggers: status changes, new assignments, quotation updates, booking confirmations
- **OPEN BUSINESS DECISION**: Push notifications (mobile), in-app, email, or combination

## 27. Ratings & Reviews

- **Status**: SCAFFOLDED (module exists, no implementation)
- Customer rates Technician/service after order COMPLETED
- Rating: 1-5 stars + text comment
- Average rating calculated for Technician profile

## 28. Repair History

- **Status**: PLANNED
- No separate table — query `service_orders` WHERE `status = 'completed'` for the customer
- Provides historical view of past repairs

## 29. Service Areas / Maps

- **Status**: SCAFFOLDED (module exists, no implementation)
- Google Maps API integration for location services
- Define serviceable geographic areas
- **OPEN BUSINESS DECISION**: Exact scope of map functionality

## 30. Dashboard

- **Status**: SCAFFOLDED
- Backend module exists, Web page shell exists
- Expected views: Admin stats, Manager stats, Technician stats

## 31. API Principles

- **Base URL**: `/api/v1`
- **Style**: RESTful with plural resource names
- **Methods**: GET (list/detail), POST (create), PATCH (partial update), DELETE
- **Authentication**: Bearer JWT token in Authorization header
- **Response Envelope**: `{ statusCode, message, data, meta? }`
- **Pagination**: `{ page, limit, total, totalPages }` in `meta`
- **Swagger**: Auto-generated at `/api/docs`

## 32. Error Handling

### Standard Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "email must be a valid email" }],
  "timestamp": "2026-09-02T10:00:00.000Z",
  "path": "/api/v1/users"
}
```

### HTTP Status Codes
| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict (duplicate, invalid state transition) |
| 500 | Internal server error |

### Rules
- Never expose database errors or stack traces to clients
- Never leak internal secrets in error responses
- Use 409 for business/state conflicts (e.g., invalid state transition)

## 33. Security Baseline

### Authentication
- JWT required for all endpoints except: health check, auth (login/register), public service catalog
- Token validation via Passport JWT Strategy

### Authorization
- RBAC via `@Roles()` decorator + `RolesGuard`
- Resource ownership validation required (e.g., Customer A cannot view Customer B's booking)
- IDOR prevention: validate requesting user owns the resource

### Input Validation
- Global `ValidationPipe` with whitelist + forbidNonWhitelisted
- All DTOs use `class-validator` decorators

### Secret Management
- `.env` files excluded from git via `.gitignore`
- `.env` files not tracked by git (verified)
- JWT_SECRET must be changed for production

### Upload Security (When Implemented)
- Validate MIME type, file extension, maximum size
- Restrict to supported image types

### AI Security
- User text/images are **untrusted input** to AI
- AI output is **untrusted data** — never use directly for business decisions
- AI failure must not expose internal errors

## 34. AI Safety / Fallback

- **Confidence below threshold**: Flag `isLowConfidence: true`, UI should show advisory notice
- **Provider unavailable**: Return fallback response allowing manual service selection
- **Timeout**: 15s timeout on Backend → AI Service call, 5s for health check
- **Rate limiting**: Handle via `AI_RATE_LIMIT` error code
- **Invalid input**: Return structured error with `fallback_allowed: true`
- AI must **never hallucinate certainty** when confidence is low

## 35. Testing Strategy

### Backend
- **Framework**: Vitest
- **Current Tests**: 15 tests (State Machine) — all passing
- **Lint**: OxLint — 0 warnings, 0 errors
- **Build**: NestJS build — passing
- **Target**: Unit tests for services, controllers, guards; integration tests for API; e2e tests

### Web
- **TypeCheck**: vue-tsc — passing
- **Build**: Vite production build — passing
- **Lint**: Not yet configured (TODO)
- **Testing Framework**: Not yet configured (TODO)

### Mobile
- **TypeCheck**: tsc --noEmit — passing
- **Lint**: Not yet configured (TODO)
- **Testing Framework**: Not yet configured (TODO)

### AI Service
- **Framework**: pytest + pytest-asyncio
- **Current Tests**: 2 tests (health check + provider contract) — all passing
- **Compile Check**: python -m compileall — passing

### Test Status Labels
| Label | Meaning |
|-------|---------|
| `PASS` | Test was executed and succeeded |
| `FAIL` | Test was executed and failed |
| `NOT VERIFIED` | Test was not executed — provide reason |

> **Never claim PASS without actually running the test.**

## 36. Deployment Overview

- **Database**: PostgreSQL 16 via Docker Compose
- **Backend**: Node.js process (`npm run start:prod`)
- **Web**: Static files from Vite build
- **Mobile**: Expo build (EAS or Expo Go for development)
- **AI Service**: Uvicorn ASGI server
- **CI**: GitHub Actions (lint, test, build for all 4 projects)

## 37. Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| Monorepo (4 projects) | Simplifies cross-project consistency for Capstone |
| NestJS modular architecture | One module per feature, clear separation |
| TypeORM over Prisma | Team familiarity, NestJS native integration |
| Vitest over Jest | Faster, modern, Vite-native |
| OxLint over ESLint | Faster for large codebases |
| Zustand over Redux | Simpler API for React Native, less boilerplate |
| AI provider abstraction | Easy swap between Gemini/OpenAI/Mock without code changes |
| Separate AI Service (FastAPI) | Python ecosystem for AI/ML, independent scaling |
| Booking ≠ Service Order | Clear lifecycle separation per domain design |
| Repair History from Service Orders | No separate table — query completed orders |

## 38. Current Limitations

- Authentication endpoints not yet implemented (scaffolded only)
- Only 1 entity defined (User) — other entities need creation
- Most backend modules are placeholders with no business logic
- No database migrations exist yet
- Web has only Login + Dashboard shell pages
- Mobile has only Login + Home screens per role
- AI providers return hardcoded skeleton responses
- No testing frameworks configured for Web or Mobile
- No lint configured for Web or Mobile

## 39. Feature Traceability Matrix

| Requirement | ID | Actor | Backend | Database | Web | Mobile | AI | Test | Status |
|------------|-----|-------|---------|----------|-----|--------|----|------|--------|
| Auth & RBAC | FR-AUTH-001 | All | Guards, Strategy | users | Auth store | Auth store | — | — | SCAFFOLDED |
| User Management | FR-USER-001 | Admin | Module | users | — | — | — | — | SCAFFOLDED |
| Technician Management | FR-TECH-001 | Admin, Tech | Module | — | — | — | — | — | SCAFFOLDED |
| Technician Verification | FR-TECH-002 | Admin | — | — | — | — | — | — | PLANNED |
| Service Catalog | FR-SERVICE-001 | All | Module | — | — | — | — | — | SCAFFOLDED |
| Categories | FR-SERVICE-002 | Admin | Module | — | — | — | — | — | SCAFFOLDED |
| AI Diagnosis | FR-AI-001 | Customer | Controller+Service | — | — | — | ✅ Endpoint | ✅ 2 tests | SCAFFOLDED |
| Booking | FR-BOOK-001 | Customer, SM | Module | — | — | — | — | — | SCAFFOLDED |
| Service Order | FR-ORDER-001 | All | Module + StateMachine | — | — | — | — | ✅ 15 tests | SCAFFOLDED |
| Quotation | FR-QUOTE-001 | Tech, Customer | Module | — | — | — | — | — | SCAFFOLDED |
| Additional Cost | FR-QUOTE-002 | Tech, Customer | — | — | — | — | — | — | PLANNED |
| Tech Recommendation | FR-ASSIGN-001 | SM | — | — | — | — | — | — | PLANNED |
| Tech Assignment | FR-ASSIGN-002 | SM | Module | — | — | — | — | — | SCAFFOLDED |
| Notifications | FR-NOTIFY-001 | All | Module | — | — | — | — | — | SCAFFOLDED |
| Reviews & Ratings | FR-REVIEW-001 | Customer | Module | — | — | — | — | — | SCAFFOLDED |
| Repair History | FR-HISTORY-001 | Customer | — | — | — | — | — | — | PLANNED |
| Media / Evidence | FR-MEDIA-001 | Tech | Module | — | — | — | — | — | SCAFFOLDED |
| Dashboard | FR-DASH-001 | Admin, SM | Module | — | ✅ Page shell | — | — | — | SCAFFOLDED |
| Service Areas | FR-MAP-001 | Admin | Module | — | — | — | — | — | SCAFFOLDED |
| Health Check | FR-SYS-001 | System | ✅ Controller | — | — | — | ✅ AI health | ✅ | IMPLEMENTED |

## 40. Glossary

| Term | Definition |
|------|-----------|
| **Booking** | A customer's request to schedule a repair service |
| **Service Order** | The execution record of a repair job, managed by State Machine |
| **Quotation** | Detailed cost breakdown created by Technician after inspection |
| **AI Diagnosis** | AI-powered preliminary assessment of a reported issue (advisory only) |
| **State Machine** | Enforced set of valid status transitions for Service Orders |
| **RBAC** | Role-Based Access Control — permissions based on user role |
| **Fallback** | Graceful degradation when AI service is unavailable |
| **Confidence** | AI's self-assessed certainty score (0.0 to 1.0) |
| **Advisory Only** | AI results are suggestions, not authoritative decisions |
| **IDOR** | Insecure Direct Object Reference — accessing others' resources by changing IDs |
