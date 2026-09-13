<h1 align="center">FixHome — Backend API</h1>

<p align="center">
  <strong>NestJS Backend API cho nền tảng sửa chữa & bảo trì tại nhà FixHome</strong>
</p>

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | NestJS |
| Language | TypeScript |
| ORM | TypeORM |
| Database | PostgreSQL 16 |
| Auth | JWT + RBAC |
| Testing | Vitest |

## Prerequisites

- **Node.js** >= 20.19 (xem `.nvmrc`)
- **npm** >= 9
- **Docker** & **Docker Compose** (for PostgreSQL)

## Quick Start

### 1. Start PostgreSQL

```bash
docker-compose up -d
```

Verify PostgreSQL is running:
```bash
docker-compose ps
```

### 2. Install & Run

```bash
cp .env.example .env
npm ci
npm run start:dev
```

### 3. Verify

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/v1/health

```bash
curl http://localhost:3000/api/v1/health
```

### Quality Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e # requires the PostgreSQL container
```

## Project Structure

```
├── src/
│   ├── app.module.ts          # Root module
│   ├── main.ts                # Entry point
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication & Authorization
│   │   ├── users/             # User management
│   │   ├── bookings/          # Booking management
│   │   ├── service-orders/    # Service order & state machine
│   │   ├── services/          # Service catalog
│   │   ├── categories/        # Service categories
│   │   ├── technicians/       # Technician management
│   │   ├── quotations/        # Quotation management
│   │   ├── reviews/           # Review system
│   │   ├── notifications/     # Notifications
│   │   ├── media/             # Media/file uploads
│   │   ├── dashboard/         # Admin dashboard
│   │   └── health/            # Health check
│   └── shared/                # Shared utilities, DTOs, enums
├── test/                      # E2E tests
├── docker/                    # PostgreSQL init scripts
├── docker-compose.yml         # PostgreSQL container
├── package.json
└── tsconfig.json
```

## Environment Variables

See [.env.example](.env.example) for all required variables.

## Related Repositories

- [Frontend](https://github.com/FixHome-SEP490/Frontend-FixHome)
- [Mobile](https://github.com/FixHome-SEP490/Mobi-FixHome)
- [AI Service](https://github.com/FixHome-SEP490/AI-FixHome)
- [Project Documentation](https://github.com/FixHome-SEP490/Docs-FixHome)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development conventions.

## Engineering Governance

Before any change, read [AGENTS.md](AGENTS.md) and the repository-specific
[AI Technical Guide](docs/AI-TECHNICAL-GUIDE.md). Pull requests are gated by this repository's own
GitHub Actions workflow for lint, type check, unit tests, build, and PostgreSQL-backed E2E tests.
