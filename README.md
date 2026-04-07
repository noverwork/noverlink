# Truley Interview

> **Live Coding Interview Platform** — A production-ready monorepo for evaluating engineering candidates

[![Nx](https://img.shields.io/badge/Nx-22.6.4-1430AD?logo=nx&logoColor=white)](https://nx.dev)
[![Node](https://img.shields.io/badge/Node-22.14-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-AGPL--3.0-orange)](LICENSE)

---

## 📋 Overview

Truley Interview is a **full-stack video upload platform** built as a comprehensive coding interview environment. Candidates can demonstrate their skills across:

- **Backend Development** — NestJS API with MikroORM
- **Frontend Development** — React + Vite with Eva Title Card design system
- **Database Design** — PostgreSQL with type-safe migrations

### Why This Exists

Traditional coding interviews use toy problems that don't reflect real work. Truley Interview provides:

1. **Production codebase** — Real architecture, real constraints, real tradeoffs
2. **Full-stack evaluation** — Assess both frontend and backend skills
3. **1-hour challenges** — Scoped tasks that fit interview timelines
4. **Clear evaluation criteria** — Objective scoring across dimensions

---

## 🏗️ Architecture

```
┌─────────────┐                    ┌─────────────┐
│   Browser   │ ───── HTTP ──────► │   Backend   │
│  (React)    │                    │  (NestJS)   │
└─────────────┘                    └─────────────┘
       │                                  │
       │                                  │
       ▼                                  ▼
┌─────────────┐                    ┌─────────────┐
│  Frontend   │                    │  PostgreSQL │
│  (Vite:4200)│                    │  (Docker)   │
└─────────────┘                    └─────────────┘
```

### Package Structure

| Package          | Tech         | Purpose                      | Build         |
| ---------------- | ------------ | ---------------------------- | ------------- |
| `frontend`       | React + Vite | Video dashboard UI           | Vite          |
| `backend`        | NestJS       | REST API, Auth, Video Upload | Webpack       |
| `backend-shared` | TypeScript   | MikroORM Entities            | None (source) |
| `migrator`       | MikroORM     | Database Migrations          | Webpack       |
| `interfaces`     | Zod + TS     | Shared Type Schemas          | tsc           |
| `shared`         | TypeScript   | Common Utilities             | tsc           |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js 22.14+
Docker (for PostgreSQL)
```

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
npm run ms:start
```

### 3. Run Migrations

```bash
npm run migrator:up
```

### 4. Start Development Servers

```bash
# Starts backend + frontend in parallel
npm run dev
```

Access:

- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000

---

## 📦 Available Scripts

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

## 🎯 Interview Challenges

### Challenge Format

Candidates choose **ONE** task to complete in **1 hour**:

#### Option A: Video Library Dashboard

- Implement `GET /api/videos` API with pagination
- Build frontend grid view with video cards
- Include: thumbnail, title, duration, upload date, views

#### Option B: Video Upload Flow

- Implement `POST /api/videos/upload` endpoint
- Frontend drag-and-drop upload with progress
- Handle file validation, size limits, error states

#### Option C: Video Analytics

- Implement `GET /api/videos/:id/stats` API
- Dashboard with view metrics, engagement charts
- Include loading/error states, period filters

### Evaluation Criteria

| Dimension         | Weight | What We Assess                         |
| ----------------- | ------ | -------------------------------------- |
| **Functionality** | 40%    | Does it work end-to-end?               |
| **Code Quality**  | 30%    | Type safety, error handling, structure |
| **UI/UX**         | 20%    | Follows design guidelines, usability   |
| **Testing**       | 10%    | Basic unit/integration tests           |

### Success Indicators

✅ **Strong Candidate:**

- Completes full feature with edge cases
- Clean TypeScript with proper types
- Follows existing patterns (CLAUDE.md, docs/)
- Handles errors gracefully
- Writes meaningful tests

⚠️ **Needs Improvement:**

- Incomplete feature (missing CRUD operations)
- Type errors suppressed with `as any`
- Ignores existing conventions
- No error handling
- No tests

---

## 🎨 Design System

### Eva Title Card Aesthetic

Inspired by Neon Genesis Evangelion's iconic title cards — **stark, compressed, cinematic**.

#### Core Principles

1. **Mechanical Compression** — `transform: scaleY(0.7) scaleX(0.85)`
2. **Deep Dark Backgrounds** — `#0a0a0a` (not pure black)
3. **Status Colors Only** — Green/Amber/Red with glow effects
4. **Episode Format** — `VIDEO.01`, `UPLOAD.00`

#### Quick Reference

```tsx
// Title (compressed serif)
<h1 style={{
  fontFamily: "'Times New Roman', Georgia, serif",
  fontWeight: 900,
  fontSize: 'clamp(4rem, 10vw, 8rem)',
  transform: 'scaleY(0.7) scaleX(0.85)',
  color: '#fff',
}}>
  VIDEO LIBRARY
</h1>

// UI Label (wide sans-serif)
<span style={{
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  fontSize: '0.8rem',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.6)',
}}>
  RECENT UPLOADS
</span>

// Status Badge (with glow)
<span style={{
  color: '#00FF00',
  textShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
  border: '1px solid #00FF00',
  padding: '4px 12px',
}}>
  PROCESSING
</span>
```

**Full documentation**: [`docs/ui-guidelines.md`](docs/ui-guidelines.md)

---

## 📚 Documentation

| Document                                                   | Purpose                         |
| ---------------------------------------------------------- | ------------------------------- |
| [`CLAUDE.md`](CLAUDE.md)                                   | AI assistant context & commands |
| [`AGENTS.md`](AGENTS.md)                                   | Agent behavior guidelines       |
| [`docs/api-design.md`](docs/api-design.md)                 | API endpoint specifications     |
| [`docs/ui-guidelines.md`](docs/ui-guidelines.md)           | Eva Title Card design system    |
| [`docs/build-guidelines.md`](docs/build-guidelines.md)     | Build configuration reference   |
| [`docs/mikroorm-relations.md`](docs/mikroorm-relations.md) | ORM patterns                    |

---

## 🔧 Environment Configuration

### Backend (`.env`)

```bash
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/app

# JWT Auth
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=15m

# OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GITHUB_CLIENT_ID=your-client-id

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

Copy from `.env.example` before running:

```bash
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env
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

## 📝 Key Technologies

### Backend Stack

- **NestJS 11** — Modular Node.js framework
- **MikroORM 6** — TypeScript ORM with entity patterns
- **PostgreSQL 17** — Primary database
- **Passport** — JWT + OAuth (Google/GitHub)
- **Pino** — High-performance logging
- **Multer** — File upload handling

### Frontend Stack

- **React 19** — UI library
- **Vite 7** — Build tool
- **React Router 7** — Client-side routing
- **TanStack Query** — Server state management
- **Tailwind CSS 4** — Utility-first styling
- **shadcn/ui** — Component primitives
- **Zod** — Runtime type validation

### Infrastructure

- **Nx** — Monorepo orchestration
- **Docker** — PostgreSQL containerization
- **GitHub Actions** — CI/CD pipelines

---

## 🎓 For Candidates

### Before You Start

1. **Read CLAUDE.md** — Understand project conventions
2. **Check docs/api-design.md** — See API specifications
3. **Review docs/ui-guidelines.md** — Follow design patterns
4. **Run existing tests** — Understand testing patterns

### During Implementation

1. **Start with TypeScript types** — Define interfaces first
2. **Follow existing patterns** — Match code style
3. **Handle errors explicitly** — No silent failures
4. **Write tests as you go** — Don't leave for the end

### Common Pitfalls

❌ Don't:

- Suppress type errors with `as any`
- Ignore existing folder structure
- Skip error handling
- Use random color values
- Leave console.log in production code

✅ Do:

- Ask clarifying questions early
- Reference existing similar code
- Commit frequently with clear messages
- Test edge cases (empty state, errors)

---

## 🤝 Contributing

This is an interview platform — contributions should maintain:

1. **Production quality** — Real-world patterns, not toy examples
2. **Clear boundaries** — 1-hour achievable scope
3. **Objective evaluation** — Clear success criteria
4. **Tech diversity** — Backend, frontend, database options

---

## 📄 License

[AGPL-3.0](LICENSE) — Open source with copyleft provisions

---

## 🎯 Philosophy

> "Good engineers don't solve toy problems perfectly. They solve real problems pragmatically."

Truley Interview evaluates **practical engineering judgment**, not algorithmic memorization. We assess:

- **Code organization** — Can they structure maintainable code?
- **Error handling** — Do they anticipate failure modes?
- **Pattern matching** — Can they read and follow conventions?
- **Communication** — Do they ask clarifying questions?

The best candidates don't write the most code — they write the **right** code.
