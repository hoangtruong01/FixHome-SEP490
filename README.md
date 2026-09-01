# FixHome

> Home Repair & Maintenance Platform – Web + Mobile

FixHome kết nối khách hàng với thợ kỹ thuật chuyên nghiệp cho dịch vụ sửa chữa và bảo trì tại nhà, hỗ trợ bởi AI chẩn đoán thông minh.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL |
| Web | Vue.js, TypeScript, TailwindCSS, Pinia |
| Mobile | React Native (Expo), TypeScript, Zustand |
| AI Service | FastAPI, Python, Gemini/OpenAI API |
| Database | PostgreSQL 16 |
| Auth | JWT + RBAC |

## Architecture

```
Web ──────┐
          │
Mobile ───┼──> NestJS Backend ───> PostgreSQL
          │
          └──> FastAPI AI Service ───> Gemini/OpenAI
```

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- **Python** >= 3.10
- **Docker** & **Docker Compose** (for PostgreSQL)
- **Expo CLI** (`npx expo`)

## Quick Start

### 1. Clone & Install

```bash
git clone <repository-url>
cd fixhome
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

Verify PostgreSQL is running:
```bash
docker-compose ps
```

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev
```

- API: http://localhost:3000/api/v1
- Swagger: http://localhost:3000/api/docs
- Health: http://localhost:3000/api/v1/health

### 4. Web Frontend

```bash
cd web
cp .env.example .env
npm install
npm run dev
```

- Web: http://localhost:5173

### 5. Mobile

```bash
cd mobile
cp .env.example .env
npm install
npx expo start
```

Scan QR code with Expo Go app or press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web

### 6. AI Service

```bash
cd ai-service
cp .env.example .env
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- API: http://localhost:8000
- Health: http://localhost:8000/health
- Docs: http://localhost:8000/docs

## Project Structure

```
fixhome/
├── backend/          # NestJS Backend API
├── web/              # Vue.js Web Frontend
├── mobile/           # React Native (Expo) Mobile App
├── ai-service/       # FastAPI AI Service
├── docs/             # Documentation (SRS, API, Database, UML)
├── docker/           # Docker configurations
├── .github/          # GitHub Actions CI
├── docker-compose.yml
├── CONTRIBUTING.md   # Development conventions
└── README.md
```

## Ports

| Service | Port |
|---------|------|
| Backend | 3000 |
| Web | 5173 |
| AI Service | 8000 |
| PostgreSQL | 5432 |
| Expo Dev Server | 19006 |

## Environment Files

Each project has its own `.env.example`. Copy and configure:

```bash
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp mobile/.env.example mobile/.env
cp ai-service/.env.example ai-service/.env
```

## Health Check

After starting all services, verify:

```bash
# Backend
curl http://localhost:3000/api/v1/health

# AI Service
curl http://localhost:8000/health
```

## Documentation

See `docs/` directory for:
- Requirements & Use Cases
- API Specification
- Database Design
- Architecture Decisions
- Test Plans

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development conventions.
