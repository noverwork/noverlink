---
name: check-standards
description: Comprehensive project standards check. Use when reviewing code changes, before commits, or when asking about code quality. Aggregates results from all specialized checkers.
---

# Comprehensive Standards Checker

Validates code against ALL project conventions using these questions:
1. "Is this a real problem or imaginary?"
2. "Is there a simpler way?"
3. "Will this break anything?"

---

## Check Process

Run each specialized checker and aggregate results:

| Category | Skill | Focus |
|----------|-------|-------|
| TypeScript | `check-typescript` | any types, Date, uuid, naming |
| MikroORM | `check-mikroorm` | v6 API, EntityManager, references |
| NestJS | `check-nestjs` | decorators, injection, controllers |
| Libraries | `check-libraries` | dayjs, nanoid, AppConfigService |
| Logging | `check-logging` | pino style, flat structure, log levels |

### Steps

1. Identify changed/relevant files
2. Run each specialized check against those files
3. Aggregate violations into unified report

---

## Output Format

```text
【Standards Check】 Pass / Issues Found

=== TypeScript ===
[Results from check-typescript or "Pass"]

=== MikroORM ===
[Results from check-mikroorm or "Pass"]

=== NestJS ===
[Results from check-nestjs or "Pass"]

=== Libraries ===
[Results from check-libraries or "Pass"]

=== Logging ===
[Results from check-logging or "Pass"]

=== Summary ===
【Fatal Issues】 [Count and brief description]
【Fix Priority】 [Ordered list of what to fix first]
```

---

## Fatal Issues (Immediate Fix Required)

- `any` type in public API
- Business logic in controllers
- Disabled eslint rules
- Direct `process.env` access in services
- `new Date()` usage (use dayjs)

---

## Reference

See individual skill files for detailed rules:
- `.claude/skills/check-typescript/SKILL.md`
- `.claude/skills/check-mikroorm/SKILL.md`
- `.claude/skills/check-nestjs/SKILL.md`
- `.claude/skills/check-libraries/SKILL.md`
- `.claude/skills/check-logging/SKILL.md`
