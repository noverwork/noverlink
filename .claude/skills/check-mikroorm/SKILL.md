---
name: check-mikroorm
description: Check MikroORM v6 code for convention violations. Use when writing or reviewing MikroORM code, entity definitions, or database operations. Validates EntityManager imports, reference access patterns, v6 API compliance, and migration practices.
---

# MikroORM v6 Convention Checker

Validates MikroORM code against v6 best practices.

## EntityManager Import

```typescript
// WRONG
import { EntityManager } from '@mikro-orm/core';

// CORRECT
import { EntityManager } from '@mikro-orm/postgresql';
```

## Repository Methods (Removed in v6)

```typescript
// WRONG - These methods don't exist in v6
await repo.persist(entity);
await repo.flush();

// CORRECT - Use EntityManager
await em.persist(entity);
await em.flush();
// or
await em.persistAndFlush(entity);
```

## Reference Access

```typescript
// NEVER - Do not use getEntity()
const user = session.user.getEntity();

// CORRECT - Use .$ for populated references
const user = session.user.$;

// For TypeScript type safety, use em.populate()
const populated = await this.em.populate(sessions, ['user']);
const user = populated[0].user.$;
```

## Entity Definitions

```typescript
// CORRECT - Use ref() for relations
import { ref, type Ref } from '@mikro-orm/core';

@Entity()
export class TunnelSession extends PgBaseEntity {
  @ManyToOne(() => User, { ref: true })
  user!: Ref<User>;

  @ManyToOne(() => Domain, { ref: true })
  domain!: Ref<Domain>;
}

// Creating with ref
const session = new TunnelSession();
session.user = ref(user);
session.domain = ref(domain);
```

## ESLint Rule Disabling

```typescript
// NEVER disable MikroORM eslint rules
// eslint-disable-next-line mikro-orm/no-get-entity  // FORBIDDEN
```

## Migrations

### Creating a Migration

**ALWAYS use `npm run migrator:create`** to create migrations:

```bash
npm run migrator:create <MigrationName>
```

This will:
1. Compare current entity definitions with the snapshot
2. Generate a migration file in `packages/migrator/src/migrations/`
3. Update `.snapshot-app.json` to reflect the new schema state

### After Creating

1. **Review the generated SQL** - auto-generated SQL may need manual adjustments
2. **Register in `packages/migrator/src/migrations/index.ts`**

```typescript
import { Migration20251207173426_InitSchema } from './Migration20251207173426_InitSchema';

export const migrationClasses: ClassConstructor<Migration>[] = [
  Migration20251207173426_InitSchema,
  // Add new migrations here
];
```

### Migration Template

```typescript
import { Migration } from '@mikro-orm/migrations';

export class Migration20251222090838_AddColumn extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "my_table" add column "my_column" varchar(255);`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "my_table" drop column "my_column";`);
  }
}
```

### Migration Commands

```bash
npm run migrator:create <name>  # Create new migration (syncs snapshot)
npm run migrator:up             # Apply pending migrations + seed
npm run migrator:down           # Rollback last migration
npm run migrator:refresh        # Reset and rerun all (dev only)
npm run migrator:seed           # Run seeders only
```

## Check Process

1. Find `@mikro-orm/core` EntityManager imports
2. Detect `repo.persist()` or `repo.flush()` calls
3. Find `.getEntity()` method calls
4. Check for disabled mikro-orm eslint rules

## Output Format

```text
【MikroORM Check】 Pass / Violations Found

Violations:
- [file:line] EntityManager imported from @mikro-orm/core
- [file:line] Using .getEntity() instead of .$

Suggested Fixes:
- Import EntityManager from @mikro-orm/postgresql
- Use .$ for populated references
```
