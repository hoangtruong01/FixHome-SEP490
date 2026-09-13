# Contributing to FixHome

## Git Convention

### Branch Strategy

```text
main              # Production-ready code
development       # Integration branch (`develop` is a temporary compatibility alias)
feature/<name>    # New features (e.g., feature/auth-login)
fix/<name>        # Bug fixes (e.g., fix/booking-validation)
```

### Workflow

1. Create branch from `development`
2. Implement changes
3. Create Pull Request to `development`
4. Code review by at least 1 team member
5. Merge after approval

### Commit Convention (Conventional Commits)

```text
feat: add user registration endpoint
fix: correct booking date validation
refactor: extract base entity
docs: update API documentation
test: add auth service unit tests
chore: update dependencies
style: fix code formatting
```

Format: `<type>: <description>`

## Code Convention

### General

- Use **TypeScript** strict mode
- Use **ESLint** + **Prettier** for formatting
- Single quotes, trailing commas, semicolons
- Tab width: 2 spaces
- Maximum line length: 100 characters (soft limit)

### Naming Convention

| Type | Convention | Example |
|------|-----------|---------|
| File (Backend) | kebab-case | `users.controller.ts` |
| File (Vue Component) | PascalCase | `LoginPage.vue` |
| File (React Component) | PascalCase | `LoginScreen.tsx` |
| File (utility) | kebab-case / camelCase | `storage.ts` |
| Class | PascalCase | `UsersService` |
| Interface | PascalCase | `ApiResponse` |
| Enum | PascalCase | `Role` |
| Variable | camelCase | `currentUser` |
| Constant | UPPER_SNAKE_CASE | `JWT_SECRET` |
| Function | camelCase | `getUserById` |
| Database table | snake_case, plural | `users`, `service_orders` |
| Database column | snake_case | `full_name`, `created_at` |
| API endpoint | kebab-case, plural | `/api/v1/service-orders` |

### Backend (NestJS)

- One module per feature
- Services contain business logic
- Controllers handle HTTP only
- Use DTOs for request validation
- Use entities for database models
- Use enums for fixed value sets

### Web (Vue.js)

- Composition API with `<script setup>`
- Pinia stores for global state
- Composables for reusable logic
- PascalCase for components
- Lazy-load route components

### Mobile (React Native)

- Functional components with hooks
- Zustand for state management
- Expo SDK for native features
- Type-safe navigation with React Navigation

## API Convention

### RESTful Endpoints

```text
GET    /api/v1/resources           # List (with pagination)
GET    /api/v1/resources/:id       # Get by ID
POST   /api/v1/resources           # Create
PATCH  /api/v1/resources/:id       # Partial update
DELETE /api/v1/resources/:id       # Delete
```

### Response Format

**Success:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": { ... }
}
```

**Paginated:**
```json
{
  "statusCode": 200,
  "message": "Success",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**Error:**
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "email must be a valid email" }
  ]
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden (wrong role) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 500 | Internal server error |

## Database Convention

- Primary keys: UUID v4
- Table names: snake_case, plural (`users`, `service_orders`)
- Column names: snake_case (`full_name`, `created_at`)
- All tables have: `id`, `created_at`, `updated_at`
- Foreign keys: `<entity>_id` format (`user_id`)
- Use migrations for schema changes
- Never use `synchronize: true` in production

## Pull Request

### Template

```markdown
## What
Brief description of changes.

## Why
Reason for the change.

## How
Implementation approach.

## Testing
How was this tested?

## Screenshots (if UI changes)
```
