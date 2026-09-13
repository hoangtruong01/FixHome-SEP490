<p align="center">
  <img src="public/logo.png" alt="FixHome Logo" width="120" />
</p>

<h1 align="center">FixHome — Web Frontend</h1>

<p align="center">
  <strong>Vue.js Web Admin Dashboard cho nền tảng sửa chữa & bảo trì tại nhà FixHome</strong>
</p>

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | Vue.js 3 |
| Language | TypeScript |
| Build Tool | Vite |
| CSS | TailwindCSS 4 |
| State | Pinia |
| Routing | Vue Router |

## Prerequisites

- **Node.js** >= 20.19 (Vite 8; xem `.nvmrc`)
- **npm** >= 9

## Quick Start

```bash
cp .env.example .env
npm ci
npm run dev
```

- Web: http://localhost:5173

## Project Structure

```
├── public/                # Static assets
│   ├── logo.png
│   ├── favicon.png
│   └── icons.svg
├── src/
│   ├── App.vue            # Root component
│   ├── main.ts            # Entry point
│   ├── api/               # API client & endpoints
│   ├── assets/            # Images, styles
│   ├── layouts/           # Page layouts (Admin, Auth)
│   ├── pages/             # Route pages
│   │   ├── auth/          # Login
│   │   └── dashboard/     # Dashboard
│   ├── router/            # Vue Router config & guards
│   ├── stores/            # Pinia stores
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Environment Variables

See [.env.example](.env.example) for configuration.

## Quality Checks

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Related Repositories

- [Backend API](https://github.com/FixHome-SEP490/Backend-FixHome)
- [Mobile](https://github.com/FixHome-SEP490/Mobi-FixHome)
- [AI Service](https://github.com/FixHome-SEP490/AI-FixHome)
- [Project Documentation](https://github.com/FixHome-SEP490/Docs-FixHome)

## Engineering Governance

Before any change, read [AGENTS.md](AGENTS.md) and the repository-specific
[AI Technical Guide](docs/AI-TECHNICAL-GUIDE.md). The independent CI workflow enforces every quality
command listed above.
