---
name: check-logging
description: Check logging code for convention violations. Use when writing or reviewing code that uses Logger or PinoLogger. Validates pino-style parameter order, flat structure, field naming, and log level usage.
---

# Logging Convention Checker

Validates logging code against project standards (pino/nestjs-pino).

---

## 1. Parameter Order (Critical)

```typescript
// WRONG - message first (doesn't work with nestjs-pino)
this.logger.info('Meeting created', { meetingId });
this.logger.debug('Processing file', { fileId });
this.logger.error('Operation failed', { error, userId });

// CORRECT - context first, message second (pino style)
this.logger.info({ meetingId, participants: 5 }, 'Meeting created');
this.logger.debug({ fileId }, 'Processing file');
this.logger.error({ error, userId }, 'Operation failed');
```

**This applies to both NestJS Logger and PinoLogger.**

---

## 2. Flat Structure

```typescript
// WRONG - nested context
this.logger.info({
  context: { tenantId: 't1', userId: 'u1' },  // Nested!
  msg: 'User logged in'
});

// CORRECT - flat structure
this.logger.info({ tenantId: 't1', userId: 'u1' }, 'User logged in');
```

**Exception**: `error` field can be nested with `type`, `message`, `stack`.

---

## 3. Field Naming (camelCase)

```typescript
// WRONG - snake_case
this.logger.info({ tenant_id: 't1', user_id: 'u1' }, 'Event');

// CORRECT - camelCase
this.logger.info({ tenantId: 't1', userId: 'u1' }, 'Event');
```

---

## 4. Structured Data (No String Interpolation)

```typescript
// WRONG - data in message string
this.logger.info({}, `Meeting ${meetingId} ended with ${count} participants`);

// CORRECT - data in context object
this.logger.info({ meetingId, participants: count }, 'Meeting ended');
```

**Why?** Structured fields can be queried in Loki/Grafana.

---

## 5. Error Logging

```typescript
// WRONG - error as string
this.logger.error({ errorMessage: error.message }, 'Failed');

// CORRECT - error object with type/message/stack
this.logger.error({
  error: {
    type: error.name,
    message: error.message,
    stack: error.stack,
  },
  userId,
}, 'Operation failed');
```

---

## 6. Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| `fatal` | System cannot continue | DB pool exhausted, OOM |
| `error` | Operation failed, needs attention | API call failed, payment error |
| `warn` | Unexpected but can continue | High retry count, quota near limit |
| `info` | Important business events | Meeting created, user login |
| `verbose` | Detailed business info | Processing steps |
| `debug` | Debug info (dev only) | SQL queries, function params |

```typescript
// WRONG - wrong level
this.logger.error({ button: 'submit' }, 'User clicked button');  // Should be debug
this.logger.debug({ paymentId }, 'Payment failed');              // Should be error

// CORRECT
this.logger.debug({ button: 'submit' }, 'User clicked button');
this.logger.error({ paymentId, error }, 'Payment failed');
```

---

## 7. Sensitive Data (Never Log)

**Prohibited:**
- Passwords, API Keys, Tokens, Secrets
- Full credit card numbers, bank accounts
- Full email, phone numbers, ID numbers

```typescript
// WRONG
this.logger.info({ email: 'user@example.com', password }, 'Login');
this.logger.info({ cardNumber: '4111111111111111' }, 'Payment');

// CORRECT
this.logger.info({ email: 'u***@example.com' }, 'Login');
this.logger.info({ cardLast4: '1234' }, 'Payment');
```

---

## 8. Include Trace IDs

```typescript
// WRONG - no context for debugging
this.logger.error({}, 'Transcription failed');

// CORRECT - include relevant IDs
this.logger.error({ tenantId, userId, mediaAssetId, error }, 'Transcription failed');
```

---

## Check Process

1. **Parameter Order**: Find `logger.info('message', {context})` pattern
2. **Flat Structure**: Detect nested objects in context (except `error`)
3. **Field Naming**: Find snake_case field names
4. **String Interpolation**: Find template literals in message with data
5. **Error Format**: Verify error objects have type/message/stack
6. **Log Levels**: Check appropriate level for content
7. **Sensitive Data**: Detect passwords, tokens, full emails in context

---

## Output Format

```text
【Logging Check】 🟢 Pass / 🔴 Violations Found

Violations:
- [file:line] Wrong parameter order: message before context
- [file:line] Nested structure in context object
- [file:line] snake_case field name: tenant_id
- [file:line] String interpolation in message
- [file:line] Missing error.stack in error log

Suggested Fixes:
- Use pino style: logger.info({ context }, 'message')
- Flatten nested objects
- Use camelCase: tenantId
- Move interpolated data to context object
- Include full error object with type/message/stack
```

---

## Reference

Extended reading: docs/pino-logger.md
