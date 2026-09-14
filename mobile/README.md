<p align="center">
  <img src="assets/icon.png" alt="FixHome Logo" width="120" />
</p>

<h1 align="center">FixHome — Mobile App</h1>

<p align="center">
  <strong>React Native (Expo) Mobile App cho nền tảng sửa chữa & bảo trì tại nhà FixHome</strong>
</p>

---

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Framework | React Native (Expo 57) |
| Language | TypeScript |
| State | Zustand |
| Navigation | React Navigation |

## Prerequisites

- **Node.js** >= 22.13 (Expo SDK 57; xem `.nvmrc`)
- **npm** >= 9
- **Expo CLI** (`npx expo`)
- **Expo Go** app on your phone (for testing)

## Quick Start

```bash
cp .env.example .env
npm ci
npm start
```

Scan QR code with Expo Go app or press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web

## Project Structure

```
├── assets/                # App icons & splash screen
├── src/
│   ├── api/               # API client
│   ├── constants/         # Config, theme
│   ├── navigation/        # React Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── CustomerNavigator.tsx
│   │   └── TechnicianNavigator.tsx
│   ├── screens/           # Screen components
│   │   ├── auth/          # Login screen
│   │   ├── customer/      # Customer screens
│   │   └── technician/    # Technician screens
│   ├── services/          # Device services (storage)
│   ├── store/             # Zustand stores
│   └── types/             # TypeScript types
├── App.tsx                # Root component
├── index.ts               # Entry point
├── app.json               # Expo config
├── package.json
└── tsconfig.json
```

## Environment Variables

See [.env.example](.env.example) for configuration.

`localhost` only works when the app can reach the Backend on the same host. For an Android
emulator use `http://10.0.2.2:3000/api/v1`; for a physical device use the development computer's
LAN IP and keep both devices on the same network.

## Setup Checks

```bash
npm run check:expo
npm run lint
npm run typecheck
npm test
```

## Related Repositories

- [Backend API](https://github.com/FixHome-SEP490/Backend-FixHome)
- [Frontend](https://github.com/FixHome-SEP490/Frontend-FixHome)
- [AI Service](https://github.com/FixHome-SEP490/AI-FixHome)
- [Project Documentation](https://github.com/FixHome-SEP490/Docs-FixHome)

## Engineering Governance

Before any change, read [AGENTS.md](AGENTS.md) and the repository-specific
[AI Technical Guide](docs/AI-TECHNICAL-GUIDE.md). The independent CI workflow uses Node 22.13+ and
enforces Expo compatibility, lint, type checking, and Jest tests.
