# MikroORM ESLint Rules

Custom ESLint rules for MikroORM usage in the Truley Companion backend.

## Rules

### `mikro-orm/ensure-request-context-requires-entity-manager`

Ensures that any class using the `@EnsureRequestContext()` decorator has `private readonly em: EntityManager` injected in its constructor.

#### Why this rule exists

The `@EnsureRequestContext()` decorator from MikroORM creates a forked context for each method execution. This requires an EntityManager instance to be available in the class. Without it, you'll get runtime errors when the decorator tries to fork the context.

#### Examples

✅ **Valid** - Has EntityManager with correct signature:

```typescript
import { EnsureRequestContext, EntityManager } from '@mikro-orm/postgresql';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';

@QueryHandler(MyQuery)
export class MyQueryHandler implements IQueryHandler<MyQuery> {
  constructor(private readonly em: EntityManager, private readonly myRepo: MyRepository) {}

  @EnsureRequestContext()
  async execute(query: MyQuery): Promise<Result> {
    // Implementation
  }
}
```

❌ **Invalid** - Missing EntityManager:

```typescript
@QueryHandler(MyQuery)
export class MyQueryHandler implements IQueryHandler<MyQuery> {
  constructor(private readonly myRepo: MyRepository) {}

  @EnsureRequestContext() // ❌ Error: Missing EntityManager
  async execute(query: MyQuery): Promise<Result> {
    // Implementation
  }
}
```

❌ **Invalid** - Wrong parameter name:

```typescript
@QueryHandler(MyQuery)
export class MyQueryHandler implements IQueryHandler<MyQuery> {
  constructor(
    private readonly entityManager: EntityManager // ❌ Must be named 'em'
  ) {}

  @EnsureRequestContext()
  async execute(query: MyQuery): Promise<Result> {
    // Implementation
  }
}
```

❌ **Invalid** - Missing modifiers:

```typescript
@QueryHandler(MyQuery)
export class MyQueryHandler implements IQueryHandler<MyQuery> {
  constructor(
    readonly em: EntityManager // ❌ Missing 'private'
  ) {}

  @EnsureRequestContext()
  async execute(query: MyQuery): Promise<Result> {
    // Implementation
  }
}
```

```typescript
@QueryHandler(MyQuery)
export class MyQueryHandler implements IQueryHandler<MyQuery> {
  constructor(
    private em: EntityManager // ❌ Missing 'readonly'
  ) {}

  @EnsureRequestContext()
  async execute(query: MyQuery): Promise<Result> {
    // Implementation
  }
}
```

## Usage

These rules are automatically applied to all TypeScript files in the project. See the root `eslint.config.mjs` for configuration.

## Testing

Run the test suite:

```bash
node libs/backend-shared/src/orm/eslint-rules/ensure-request-context-requires-entity-manager.test.mjs
```
