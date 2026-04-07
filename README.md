# Truley Interview

> **Video Upload Platform** — Full-stack monorepo with React + NestJS

[![Nx](https://img.shields.io/badge/Nx-22.6.4-1430AD?logo=nx&logoColor=white)](https://nx.dev)
[![Node](https://img.shields.io/badge/Node-22.14-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 22.14+
- Docker (for PostgreSQL)

### 1. Install Dependencies

```bash
npm install
```

### 2. Copy Environment Files

```bash
# Backend
cp packages/backend/.env.example packages/backend/.env

# Frontend
cp packages/frontend/.env.example packages/frontend/.env
```

> ⚠️ **Important**: You must copy `.env.example` to `.env` for both backend and frontend before running the application.

### 3. Start PostgreSQL

```bash
npm run ms:start
```

### 4. Setup Migrator Environment

```bash
cp packages/migrator/.env.example packages/migrator/.env
```

### 5. Run Database Migrations

```bash
# Run all pending migrations
npm run migrator:up

# Rollback last migration
npm run migrator:down

# Create a new migration (when DB schema changes)
npm run migrator:create <migration-name>

# Refresh database schema (development only)
npm run migrator:refresh
```

> **Note**: Migrations are located in `packages/migrator/src/migrations/`. Each migration file contains schema changes that are applied to PostgreSQL.

#### When You Change Database Schema

If you modify entities in `packages/backend-shared/`:

1. **Create a new migration**:

   ```bash
   npm run migrator:create AddUserTable
   ```

2. **Review the generated migration file** in `packages/migrator/src/migrations/`

3. **Apply the migration**:

   ```bash
   npm run migrator:up
   ```

4. **Verify** the changes in PostgreSQL

### 5. Start Development Servers

```bash
# Starts backend + frontend in parallel
npm run dev
```

Access:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

---

## 📦 Package Structure

| Package          | Tech         | Purpose                      |
| ---------------- | ------------ | ---------------------------- |
| `frontend`       | React + Vite | Video dashboard UI           |
| `backend`        | NestJS       | REST API, Auth, Video Upload |
| `backend-shared` | TypeScript   | MikroORM Entities            |
| `migrator`       | MikroORM     | Database Migrations          |
| `interfaces`     | Zod + TS     | Shared Type Schemas          |
| `shared`         | TypeScript   | Common Utilities             |

---

## 📋 Available Scripts

| Command                          | Description                         |
| -------------------------------- | ----------------------------------- |
| `npm run dev`                    | Start backend + frontend (parallel) |
| `npm run backend:dev`            | Start backend only                  |
| `npm run frontend:dev`           | Start frontend only                 |
| `npm run ms:start`               | Start PostgreSQL (Docker)           |
| `npm run ms:stop`                | Stop PostgreSQL                     |
| `npm run migrator:up`            | Run database migrations             |
| `npm run migrator:down`          | Rollback migrations                 |
| `npm run migrator:create <name>` | Create new migration                |
| `npm run typecheck`              | Type check all packages             |
| `npm run lint`                   | Lint all packages                   |
| `npm run test`                   | Run all tests                       |

### Nx Commands

```bash
# Build specific package
npx nx build @truley-interview/backend
npx nx build @truley-interview/frontend

# Test specific package
npx nx test @truley-interview/backend

# Lint specific package
npx nx lint @truley-interview/frontend

# Visualize dependency graph
npx nx graph
```

---

## 🔧 Environment Configuration

### Backend (`.env`)

```bash
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app

# JWT Auth
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=15m

# Frontend URL for OAuth redirects
FRONTEND_URL=http://localhost:4200

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=104857600  # 100MB
```

### Frontend (`.env`)

```bash
VITE_API_URL=http://localhost:3000
VITE_APP_URL=http://localhost:4200
```

---

## 🧪 Testing

```bash
# All tests
npm run test

# Backend tests only
npx nx test @truley-interview/backend

# Frontend tests only
npx nx test @truley-interview/frontend
```

---

## 📝 Tech Stack

### Backend

- NestJS 11
- MikroORM 6
- PostgreSQL 17
- Passport (JWT + OAuth)
- Pino logging

### Frontend

- React 19
- Vite 7
- React Router 7
- TanStack Query
- Tailwind CSS 4
- shadcn/ui

### Infrastructure

- Nx monorepo
- Docker (PostgreSQL)
