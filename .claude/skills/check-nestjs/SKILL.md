---
name: check-nestjs
description: Check NestJS code for convention violations. Use when writing or reviewing NestJS controllers, services, or modules. Validates decorator usage, repository injection, controller responsibilities, environment access, and import patterns.
---

# NestJS Convention Checker

Validates NestJS code against project patterns.

## Repository Injection

```typescript
// WRONG - Custom repositories don't need @InjectRepository
constructor(
  @InjectRepository(User)  // Not needed!
  private readonly userRepo: UserRepository
) {}

// CORRECT - Direct injection with EntityManager
constructor(
  private readonly em: EntityManager,
) {}
```

## Controller Responsibilities

```typescript
// CORRECT - Controller handles HTTP, delegates to service
@Controller('tunnels')
export class TunnelsController {
  constructor(private readonly tunnelsService: TunnelsService) {}

  @Post('ticket')
  async createTicket(@CurrentUser() user: User, @Body() dto: CreateTicketDto) {
    return this.tunnelsService.createTicket(user, dto);
  }
}

// WRONG - Business logic in controller
@Controller('tunnels')
export class TunnelsController {
  @Post('ticket')
  async createTicket(@Body() dto: CreateTicketDto) {
    const domain = await this.em.findOne(Domain, { ... });  // Business logic!
    const ticket = this.signTicket(domain);
    return { ticket };
  }
}
```

**Controller rules:**
- Only handle HTTP endpoints
- Validate DTOs
- Delegate to Services
- NO business logic
- NO direct EntityManager usage

## Environment Variable Access

```typescript
// WRONG - Direct process.env access
const apiKey = process.env.API_KEY;

// CORRECT - Use AppConfigService
@Injectable()
export class SomeService {
  constructor(private readonly appConfigService: AppConfigService) {}

  someMethod() {
    const { ticketSecret } = this.appConfigService.tunnel;
    const { port } = this.appConfigService.app;
  }
}
```

## Import Patterns

```typescript
// CORRECT - Import from shared lib
import { User, Domain, TunnelSession } from '@noverlink/backend-shared';

// WRONG - Relative path imports
import { User } from '../../../libs/backend-shared/src/orm/entities';
```

## Guard Usage

```typescript
// CORRECT - Use guards for auth
@Controller('tunnels')
@UseGuards(JwtAuthGuard)
export class TunnelsController {
  @Get()
  async list(@CurrentUser() user: Loaded<User, 'plan'>) {
    return this.tunnelsService.listForUser(user);
  }
}
```

## Check Process

1. Check controllers for direct EntityManager usage (should use Services)
2. Find `process.env` access (should use `AppConfigService`)
3. Detect relative imports from `libs/` or `packages/` directories
4. Verify guards are used for protected endpoints

## Output Format

```text
【NestJS Check】 Pass / Violations Found

Violations:
- [file:line] Controller has business logic (direct EntityManager usage)
- [file:line] Direct process.env access
- [file:line] Relative import from packages/

Suggested Fixes:
- Move business logic to Service
- Use AppConfigService instead of process.env
- Import from @noverlink/backend-shared
```
