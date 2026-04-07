# Truley Interview Challenge

> **Live Coding Assessment** — Demonstrate your full-stack engineering skills in a production codebase

---

## 📋 Overview

**Time Limit:** 60 minutes  
**Choice:** Select **ONE** challenge from three options  
**Tech Stack:** TypeScript, NestJS, React, PostgreSQL

### What We Assess

| Dimension         | Weight | Focus Areas                                  |
| ----------------- | ------ | -------------------------------------------- |
| **Functionality** | 40%    | Does it work end-to-end? Edge cases handled? |
| **Code Quality**  | 30%    | Type safety, error handling, structure       |
| **UI/UX**         | 20%    | Follows design guidelines, usability         |
| **Testing**       | 10%    | Basic unit/integration tests                 |

---

## 🎯 Challenge Options

### Option A: Video Library Dashboard

**Goal:** Build a dashboard displaying uploaded videos with pagination.

#### Backend Tasks

- [ ] Implement `GET /api/videos` endpoint
- [ ] Query `Video` entities with pagination
- [ ] Include: title, description, duration, views, uploadDate
- [ ] Support filtering by status (`processing`, `ready`, `error`)

**API Spec:**

```typescript
GET /api/videos?status=ready&limit=20&cursor=xxx

Response: {
  videos: Video[],
  nextCursor: string | null,
  hasMore: boolean
}
```

#### Frontend Tasks

- [ ] Create `VideoGrid` component
- [ ] Display: thumbnail, title, duration, views, upload date
- [ ] Implement status badge (ready = green, processing = amber, error = red)
- [ ] Add loading and empty states
- [ ] Follow Eva Title Card design (see `docs/ui-guidelines.md`)

**Success Criteria:**

- ✅ Grid displays real data from database
- ✅ Pagination works (load more button or infinite scroll)
- ✅ Status indicators are clear
- ✅ UI matches design guidelines

**Estimated Time:** 45-60 minutes

---

### Option B: Video Upload Flow

**Goal:** Implement complete video upload with progress tracking.

#### Backend Tasks

- [ ] Implement `POST /api/videos/upload` endpoint
- [ ] Handle multipart/form-data with Multer
- [ ] Validate file type (mp4, webm, mov) and size (max 100MB)
- [ ] Create `Video` entity with `processing` status
- [ ] Return video metadata with upload progress

**API Spec:**

```typescript
POST /api/videos/upload
Content-Type: multipart/form-data

Body: {
  file: File,
  title: string,
  description?: string
}

Response: {
  id: string,
  title: string,
  status: 'processing' | 'ready' | 'error',
  uploadProgress: number,
  createdAt: string
}
```

#### Frontend Tasks

- [ ] Create `UploadDropzone` component with drag-and-drop
- [ ] Display upload progress bar (0-100%)
- [ ] Show file validation errors (type, size)
- [ ] Implement success/error states
- [ ] Add metadata form (title, description)

**Success Criteria:**

- ✅ Drag-and-drop works
- ✅ Progress bar updates during upload
- ✅ File validation with clear error messages
- ✅ Success state shows uploaded video info

**Estimated Time:** 50-60 minutes

---

### Option C: Video Analytics Dashboard

**Goal:** Build a metrics dashboard showing video performance.

#### Backend Tasks

- [ ] Implement `GET /api/videos/:id/stats` endpoint
- [ ] Calculate: total views, unique viewers, watch time
- [ ] Aggregate by period (`today`, `week`, `month`)
- [ ] Return engagement metrics (avg watch time, completion rate)

**API Spec:**

```typescript
GET /api/videos/:id/stats?period=week

Response: {
  videoId: string,
  totalViews: number,
  uniqueViewers: number,
  watchTime: {
    total: 36000,  // seconds
    formatted: "10h 0m"
  },
  engagement: {
    avgWatchTime: 180,  // seconds
    completionRate: 0.75
  },
  period: {
    start: string,
    end: string
  }
}
```

#### Frontend Tasks

- [ ] Create `StatsCard` component (reusable)
- [ ] Display 4 metrics: views, viewers, watch time, engagement
- [ ] Add period selector (today/week/month)
- [ ] Implement loading skeleton
- [ ] Handle empty/error states

**Success Criteria:**

- ✅ Metrics display correctly
- ✅ Numbers formatted nicely (1.5K views, 10h watch time)
- ✅ Period selector updates data
- ✅ Loading states implemented

**Estimated Time:** 45-60 minutes

---

## 🚀 Getting Started

### 1. Setup Environment

```bash
# Install dependencies
npm install

# Start PostgreSQL
npm run ms:start

# Run migrations
npm run migrator:up

# Start dev servers
npm run dev
```

Access:

- **Frontend:** http://localhost:4200
- **Backend:** http://localhost:3000

### 2. Read Required Docs

**Mandatory:**

- [`CLAUDE.md`](CLAUDE.md) — Project conventions
- [`docs/api-design.md`](docs/api-design.md) — API specifications
- [`docs/ui-guidelines.md`](docs/ui-guidelines.md) — Design system

**Reference:**

- [`docs/build-guidelines.md`](docs/build-guidelines.md) — Build configuration
- [`docs/mikroorm-relations.md`](docs/mikroorm-relations.md) — ORM patterns

### 3. Explore Codebase

```bash
# View existing API structure
ls packages/backend/src/app/

# View existing components
ls packages/frontend/src/app/

# View entity definitions
ls packages/backend-shared/src/
```

---

## 📝 Implementation Guide

### Step 1: Plan (5 minutes)

Before coding:

- [ ] Choose your challenge (A, B, or C)
- [ ] Identify existing patterns to follow
- [ ] Define your file structure
- [ ] List required imports/dependencies

### Step 2: Backend First (20-25 minutes)

1. **Create DTO/Input types**

   ```typescript
   // packages/interfaces/src/
   export interface CreateVideoDto {
     title: string;
     description?: string;
     file?: Express.Multer.File;
   }
   ```

2. **Implement service layer**

   ```typescript
   // packages/backend/src/app/
   export class VideoService {
     constructor(@InjectRepository() private repo: EntityRepository<Video>) {}

     async findAll(filters: VideoFilters): Promise<Paginated<Video>> {
       // Your implementation
     }
   }
   ```

3. **Create controller endpoint**

   ```typescript
   @Controller('/api/videos')
   export class VideoController {
     @Get()
     async list(@Query() filters: VideoFilters) {
       // Your implementation
     }
   }
   ```

4. **Test with curl or Postman**
   ```bash
   curl http://localhost:3000/api/videos \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

### Step 3: Frontend (20-25 minutes)

1. **Create component structure**

   ```bash
   packages/frontend/src/app/
   ├── videos/
   │   ├── page.tsx          # Route page
   │   ├── video-grid.tsx    # Grid component
   │   └── video-card.tsx    # Individual card
   ```

2. **Implement API client**

   ```typescript
   // packages/frontend/src/lib/api.ts
   export async function getVideos(params: VideoParams) {
     const res = await fetch(`/api/videos?${new URLSearchParams(params)}`);
     return res.json();
   }
   ```

3. **Build UI components**
   - Follow design guidelines (`docs/ui-guidelines.md`)
   - Use existing components from `packages/frontend/src/components/`
   - Implement loading/error states

### Step 4: Testing (10 minutes)

```bash
# Run backend tests
npx nx test @truley-interview/backend

# Run frontend tests
npx nx test @truley-interview/frontend

# Or add a quick test file
touch packages/backend/src/app/videos/video.controller.spec.ts
```

**Minimum test coverage:**

- [ ] One happy path test
- [ ] One error case test

---

## ✅ Evaluation Rubric

### Functionality (40 points)

| Score | Criteria                                           |
| ----- | -------------------------------------------------- |
| 35-40 | Complete feature, all edge cases, works flawlessly |
| 25-34 | Core functionality works, minor gaps               |
| 15-24 | Partial implementation, major gaps                 |
| 0-14  | Doesn't compile or run                             |

### Code Quality (30 points)

| Score | Criteria                                                 |
| ----- | -------------------------------------------------------- |
| 27-30 | Clean TypeScript, proper types, excellent error handling |
| 20-26 | Good structure, minor type issues                        |
| 10-19 | Inconsistent patterns, type errors                       |
| 0-9   | Messy code, `as any` abuse, no error handling            |

### UI/UX (20 points)

| Score | Criteria                                        |
| ----- | ----------------------------------------------- |
| 18-20 | Follows design guidelines, polished, accessible |
| 12-17 | Decent UI, minor style issues                   |
| 6-11  | Functional but ugly, ignores guidelines         |
| 0-5   | Broken UI, no styling                           |

### Testing (10 points)

| Score | Criteria                                  |
| ----- | ----------------------------------------- |
| 9-10  | Multiple tests, good coverage, edge cases |
| 6-8   | Basic tests for happy path                |
| 3-5   | Minimal tests                             |
| 0-2   | No tests                                  |

---

## 🚫 Common Mistakes to Avoid

### Critical Errors (Automatic Fail)

❌ **Type Safety Violations**

```typescript
// NEVER do this
const data = response as any;
const user = user as User; // without checking
```

❌ **Silent Error Swallowing**

```typescript
// NEVER do this
try {
  await this.service.doSomething();
} catch (e) {
  // empty catch
}
```

❌ **Ignoring Existing Patterns**

- Creating new folder structure
- Not following naming conventions
- Re-inventing existing utilities

### Minor Issues (Point Deductions)

⚠️ **Code Style**

- Inconsistent indentation
- Missing semicolons (if project uses them)
- Inconsistent naming (camelCase vs snake_case)

⚠️ **Missing Features**

- No loading states
- No error messages
- No empty states

⚠️ **Poor UX**

- Non-descriptive error messages
- No confirmation for destructive actions
- Confusing UI flow

---

## 💡 Tips for Success

### Before You Start

1. **Read CLAUDE.md** — Understand project conventions
2. **Check existing code** — Find similar patterns
3. **Ask clarifying questions** — We value communication

### During Implementation

1. **Start with types** — Define interfaces first
2. **Follow existing patterns** — Match code style
3. **Handle errors explicitly** — No silent failures
4. **Write tests as you go** — Don't leave for the end
5. **Commit frequently** — Show your thought process

### Time Management

| Time      | Milestone                   |
| --------- | --------------------------- |
| 0-5 min   | Choose challenge, read docs |
| 5-30 min  | Backend implementation      |
| 30-55 min | Frontend implementation     |
| 55-60 min | Final testing, cleanup      |

### If You Get Stuck

1. **Check existing code** — Similar patterns exist
2. **Read error messages** — They're usually helpful
3. **Ask for hints** — We're here to help
4. **Simplify** — Do the minimum viable version first

---

## 📤 Submission

### What to Submit

1. **Git repository** with your changes
2. **Brief README** in your branch:

   ```markdown
   # My Solution

   ## Challenge: Option B (Video Upload)

   ## What I Implemented

   - [x] Upload endpoint with Multer
   - [x] Drag-and-drop frontend
   - [x] Progress bar
   - [ ] File type validation (ran out of time)

   ## Known Issues

   - Progress bar could be smoother
   - No unit tests for edge cases

   ## Questions

   - Should we generate thumbnails automatically?
   ```

### Git Best Practices

```bash
# Commit frequently with clear messages
git add .
git commit -m "feat: implement video upload endpoint"
git commit -m "feat: add drag-and-drop upload UI"
git commit -m "fix: handle large file errors"

# Push your branch
git push origin challenge/my-name-option-b
```

---

## 🎯 What Makes a Strong Candidate?

### Technical Skills

✅ **Type Safety**

- Uses proper TypeScript types
- No `as any` or `@ts-ignore`
- Validates input with Zod/class-validator

✅ **Error Handling**

- Explicit try/catch blocks
- Meaningful error messages
- Proper HTTP status codes

✅ **Code Organization**

- Follows existing folder structure
- Separates concerns (controller/service/repository)
- Reusable components

### Soft Skills

✅ **Communication**

- Asks clarifying questions
- Explains tradeoffs
- Documents assumptions

✅ **Problem Solving**

- Breaks down complex problems
- Prioritizes core functionality
- Adapts when stuck

✅ **Attention to Detail**

- Consistent code style
- Edge case handling
- Clean commit history

---

## 🔗 Resources

### Documentation

- [CLAUDE.md](CLAUDE.md) — Project conventions
- [API Design](docs/api-design.md) — API specifications
- [UI Guidelines](docs/ui-guidelines.md) — Design system
- [Build Guidelines](docs/build-guidelines.md) — Build configuration

### External References

- [NestJS Documentation](https://docs.nestjs.com)
- [React Documentation](https://react.dev)
- [MikroORM Documentation](https://mikroorm.io)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## ❓ FAQ

**Q: Can I use external libraries?**  
A: Use existing project dependencies. Don't add new packages unless absolutely necessary.

**Q: Should I focus on backend or frontend?**  
A: Both are important. Aim for a working end-to-end flow over perfect individual pieces.

**Q: What if I don't finish?**  
A: That's okay! We assess the quality of what you did complete. Document what you would have done with more time.

**Q: Can I ask questions?**  
A: Yes! We value communication. Ask early and often.

**Q: Should I write tests?**  
A: Yes, but prioritize functionality first. Basic tests are better than no tests.

---

## 🎯 Good Luck!

Remember: We're not looking for perfect code. We're looking for **practical engineering judgment**.

> "Good engineers don't solve toy problems perfectly. They solve real problems pragmatically."

**Focus on:**

- Making it work
- Making it clean
- Making it maintainable

You've got this! 🚀
