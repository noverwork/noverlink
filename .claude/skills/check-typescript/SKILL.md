---
name: check-typescript
description: Check TypeScript code for project convention violations. Use when writing or reviewing TypeScript code. Validates types, naming, destructuring, imports, generics, null handling, and error patterns.
---

# TypeScript Convention Checker

Validates TypeScript code against project standards.

---

## 1. Forbidden Patterns

```typescript
// NEVER use these
function process(data: any): any {}  // No 'any' types
const now = new Date();              // No native Date (use dayjs)
const id = uuid();                   // No uuid (use nanoid)
```

---

## 2. Type Definitions

### Interface vs Type

```typescript
// PREFERRED - interface (extensible)
interface User {
  id: string;
  email: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Use type for: union, mapped, utility types
type UserRole = 'admin' | 'user' | 'guest';
type ReadonlyUser = Readonly<User>;
```

### Unknown over Any

```typescript
// WRONG
function processData(data: any): any { }

// CORRECT
function processData(data: unknown): Result {
  if (typeof data === 'object' && data !== null) { }
}
```

---

## 3. Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files/Dirs | `kebab-case` | `user-service.ts` |
| Functions/Vars | `camelCase` | `getUserById` |
| Classes/Interfaces | `PascalCase` | `UserService` |
| Constants/Env | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT` |

---

## 4. Destructuring

```typescript
// GOOD - object destructuring
const { query, body } = request;
const { value: notifications = [] } = body;

// GOOD - nested destructuring
const { graphWebhook: { clientState } } = this.appConfigService;

// GOOD - array destructuring
const [first, second, ...rest] = items;

// BAD - repetitive property access
const notifications = body.value || [];
const clientState = this.appConfigService.graphWebhook.clientState;
```

---

## 5. Function Definitions

```typescript
// GOOD - explicit return type
async function findUserById(userId: string): Promise<User | null> {
  return this.userRepository.findOne({ id: userId });
}

// BAD - implicit any return
async function findUserById(userId: string) {
  return this.userRepository.findOne({ id: userId });
}
```

---

## 6. Generics

```typescript
// GOOD - meaningful generic names
interface Repository<TEntity> {
  find(criteria: Partial<TEntity>): Promise<TEntity[]>;
}

// BAD - meaningless single letter (unless standard convention)
interface Repo<T> {
  find(x: Partial<T>): Promise<T[]>;
}
```

---

## 7. Null Handling

```typescript
// GOOD - optional chaining + nullish coalescing
const userName = user?.profile?.name ?? 'Anonymous';

// BAD - verbose null checks
const userName = user && user.profile && user.profile.name
  ? user.profile.name : 'Anonymous';

// Non-null assertion - use sparingly, prefer explicit check
const element = document.getElementById('app')!;  // ⚠️ risky
```

---

## 8. Import Order

```typescript
// 1. Node.js built-ins
import { readFile } from 'fs/promises';

// 2. Third-party packages
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

// 3. Internal modules (by path length)
import { User } from '@truley-companion/backend-shared';
import { CreateUserDto } from './dto/create-user.dto';

// Use import type for type-only imports
import type { Request, Response } from 'express';
```

---

## 9. Enums

```typescript
// GOOD - string enum (serializable, readable)
export enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}
```

---

## 10. Error Handling

```typescript
// GOOD - custom error class
export class UserNotFoundException extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundException';
  }
}

// GOOD - type-safe error handling
try {
  await processUser(userId);
} catch (error) {
  if (error instanceof UserNotFoundException) {
    return null;
  }
  throw error;
}
```

---

## Check Process

1. **Types**: Find `any` usage, missing return types
2. **Libraries**: `new Date()` → dayjs, `uuid()` → nanoid
3. **Naming**: kebab-case files, camelCase functions, PascalCase classes
4. **Destructuring**: Repeated property access that could be destructured
5. **Imports**: Order, `import type` for type-only
6. **Generics**: Meaningful names (TEntity, not T)
7. **Null Handling**: Verbose checks → optional chaining

---

## Output Format

```text
【TypeScript Check】 🟢 Pass / 🔴 Violations Found

Violations:
- [file:line] 'any' type in function parameter
- [file:line] new Date() usage
- [file:line] Missing explicit return type
- [file:line] Repeated property access (use destructuring)

Suggested Fixes:
- Replace any with unknown or proper type
- Replace new Date() with dayjs()
- Add explicit return type annotation
- Use destructuring: const { x, y } = obj
```

---

## Reference

Extended reading: docs/typescript-guidelines.md
