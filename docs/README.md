<p align="center">
  <img src="assets/logo.png" alt="FixHome Logo" width="120" />
</p>

<h1 align="center">FixHome — Documentation</h1>

<p align="center">
  <strong>Tài liệu dự án cho nền tảng sửa chữa & bảo trì tại nhà FixHome</strong>
</p>

---

## Contents

| Thư mục | Nội dung |
|---------|---------|
| `requirements/` | Yêu cầu chức năng, actors, phạm vi dự án |
| `architecture/` | Kiến trúc hệ thống, booking vs service-order |
| `database/` | Quy ước đặt tên database |
| `api/` | API specification |
| `deployment/` | Hướng dẫn deploy |
| `testing/` | Test plans |
| `uml/` | UML diagrams |
| `assets/` | Logo và hình ảnh |

## Key Documents

- [PROJECT_DOCUMENTATION.md](PROJECT_DOCUMENTATION.md) — Single Source of Truth
- [AI_DEVELOPMENT_WORKFLOW.md](AI_DEVELOPMENT_WORKFLOW.md) — Quy trình phát triển với AI
- [CURRENT_TASKS.md](CURRENT_TASKS.md) — Trạng thái và backlog hiện tại
- [REPOSITORY_GUIDE.md](REPOSITORY_GUIDE.md) — Bản đồ repo và hướng dẫn setup local
- [MEMBER1-FINAL-AUDIT.md](docs/MEMBER1-FINAL-AUDIT.md) — Member 1 Final Audit Report & Quality Gate
- [MEMBER1-INTEGRATION.md](docs/MEMBER1-INTEGRATION.md) — Member 1 Integration Guide & Cross-module Contracts
- [AGENTS.md](AGENTS.md) — Hướng dẫn cho AI coding agents
- [CONTRIBUTING.md](CONTRIBUTING.md) — Quy ước phát triển

## Architecture Overview

```text
Web ──────┐
          │
Mobile ───┼──> NestJS Backend ───> PostgreSQL
          │
          └──> FastAPI AI Service ───> Gemini/OpenAI
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL |
| Web | Vue.js 3, TypeScript, TailwindCSS 4, Pinia |
| Mobile | React Native (Expo 57), TypeScript, Zustand |
| AI Service | FastAPI, Python, Gemini / OpenAI |
| Auth | JWT + RBAC |
| Database | PostgreSQL 16 |

## Repositories

| Repository | Ownership |
|------------|-----------|
| [Backend-FixHome](https://github.com/FixHome-SEP490/Backend-FixHome) | NestJS API, database migrations, PostgreSQL dev setup |
| [Frontend-FixHome](https://github.com/FixHome-SEP490/Frontend-FixHome) | Vue web application |
| [Mobi-FixHome](https://github.com/FixHome-SEP490/Mobi-FixHome) | Expo mobile application |
| [AI-FixHome](https://github.com/FixHome-SEP490/AI-FixHome) | FastAPI AI diagnosis service |
| [Docs-FixHome](https://github.com/FixHome-SEP490/Docs-FixHome) | Requirements, architecture, contracts, testing, and governance |

## Engineering Governance

Read [AGENTS.md](AGENTS.md) and the repository-specific
[AI Technical Guide](docs/AI-TECHNICAL-GUIDE.md) before editing. Validate documentation locally:

```bash
npm ci
npm run lint
npm run check:links
npm run validate
```

The independent Docs CI treats Markdown style, missing local links, and governance structure as
blocking failures.
