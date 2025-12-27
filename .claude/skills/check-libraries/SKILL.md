---
name: check-libraries
description: Check code for standard library usage violations. Use when writing or reviewing code that involves dates, IDs, or environment variables. Validates usage of dayjs, nanoid, and AppConfigService instead of forbidden alternatives.
---

# Standard Library Usage Checker

Validates code uses project-approved libraries.

## Required Libraries

| Use This | Don't Use |
|----------|-----------|
| `dayjs()` | `new Date()`, date-fns, moment |
| `nanoid()` | uuid, crypto.randomUUID() |
| `AppConfigService` | `process.env` |

## Date/Time Handling

```typescript
// WRONG
import { format } from 'date-fns';
import moment from 'moment';
const now = new Date();

// CORRECT
import dayjs from 'dayjs';
const now = dayjs();
```

## ID Generation

```typescript
// WRONG
import { v4 as uuid } from 'uuid';
const id = uuid();
const id = crypto.randomUUID();

// CORRECT
import { nanoid } from 'nanoid';
const id = nanoid();
```

## Environment Variables

```typescript
// WRONG - Direct env access
const apiKey = process.env.API_KEY;
const port = process.env.PORT;

// CORRECT - Use AppConfigService with typed getters
constructor(private readonly configService: AppConfigService) {}
const apiKey = this.configService.polar.webhookSecret;
const port = this.configService.app.port;
```

## Environment Files

- **NEVER modify `.env` files directly**
- Backend vars: `packages/backend/.env.example`
- Frontend vars: `packages/frontend/.env.example`

## Check Process

1. Find `new Date()` usage
2. Detect `date-fns` or `moment` imports
3. Find `uuid` imports
4. Detect direct `process.env` access
5. Check for modifications to `.env` files

## Output Format

```text
【Libraries Check】 Pass / Violations Found

Violations:
- [file:line] Using new Date() instead of dayjs()
- [file:line] Importing uuid instead of nanoid
- [file:line] Direct process.env access

Suggested Fixes:
- Replace new Date() with dayjs()
- Replace uuid import with nanoid
- Use AppConfigService for environment variables
```
