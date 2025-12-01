# Write Unit Tests

Write unit tests for the specified file or module.

## What to Test

### Backend (NestJS) - Must Test

| Type | Description | Example |
|------|-------------|---------|
| **Services** | Business logic, external API calls, data processing | `billing.service.ts`, `relay.service.ts` |
| **Controllers** | HTTP endpoint logic, request validation, response formatting | `auth.controller.ts` |
| **Guards** | Authentication/authorization logic | `jwt-auth.guard.ts`, `cli-auth.guard.ts` |
| **Interceptors** | Request/response transformation with logic | Custom interceptors |
| **Utilities** | Helper functions with logic | `cursor-pagination.ts` |

### Frontend (Next.js) - Must Test

| Type | Description | Example |
|------|-------------|---------|
| **Pages** | Page rendering and basic interactions | `page.tsx` |
| **Components** | UI components with logic or state | `GlowButton.tsx`, `PulseBadge.tsx` |
| **Hooks** | Custom React hooks with business logic | `use-auth.ts`, `use-tunnel.ts` |
| **Utilities** | Helper functions | `utils.ts` |
| **Stores** | State management with actions | Zustand stores |

### Rust (relay/cli) - Must Test

| Type | Description | Example |
|------|-------------|---------|
| **Core Logic** | Business logic functions | `ticket.rs` (verification) |
| **Protocol Handlers** | Message parsing and handling | `handlers/*.rs` |
| **Auth** | Authentication and credential management | `auth.rs` |
| **Utilities** | Helper functions with logic | Serialization helpers |

### Do NOT Test (No Business Logic)

| Type | Reason |
|------|--------|
| **Modules** | Pure configuration, no logic - NestJS handles wiring |
| **DTOs** | Pure data structures, no logic |
| **Entities** | Unless they have computed properties or methods |
| **Constants** | Unless they involve computation |
| **Types/Interfaces** | TypeScript/Rust compile-time only |
| **Index files** | Re-exports only |
| **main.rs/main.ts** | Entry points with minimal logic |

## Testing Patterns

### Backend (Jest + NestJS Testing)

```typescript
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('MyService', () => {
  let service: MyService;
  let mockDependency: jest.Mocked<SomeDependency>;

  beforeEach(async () => {
    // Suppress logger output
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();

    // Create mock
    mockDependency = {
      someMethod: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        { provide: SomeDependency, useValue: mockDependency },
      ],
    }).compile();

    service = module.get(MyService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('methodName', () => {
    it('should do something successfully', async () => {
      mockDependency.someMethod.mockResolvedValue(expectedResult);

      const result = await service.methodName(input);

      expect(result).toEqual(expected);
      expect(mockDependency.someMethod).toHaveBeenCalledWith(expectedArgs);
    });

    it('should handle errors', async () => {
      mockDependency.someMethod.mockRejectedValue(new Error('Failed'));

      await expect(service.methodName(input)).rejects.toThrow('Failed');
    });
  });
});
```

### Frontend (Jest + React Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import React from 'react';

import MyComponent from '../src/components/MyComponent';

// Mock Next.js modules
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/test',
}));

describe('MyComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should render successfully', () => {
    const { baseElement } = render(<MyComponent />);
    expect(baseElement).toBeTruthy();
  });

  it('should display expected content', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeTruthy();
  });

  it('should have clickable elements', () => {
    render(<MyComponent />);
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeTruthy();
  });
});
```

### Rust (Built-in Test Framework)

```rust
//! Module description
//!
//! Main functionality here...

use anyhow::Result;

/// Main function with business logic
pub fn process_data(input: &str) -> Result<String> {
    if input.is_empty() {
        anyhow::bail!("Input cannot be empty");
    }
    Ok(format!("Processed: {}", input))
}

/// Helper function
fn validate_input(input: &str) -> bool {
    !input.is_empty() && input.len() < 100
}

// Tests module - placed at the bottom of the file
#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[test]
    fn test_process_data_success() {
        let result = process_data("hello");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "Processed: hello");
    }

    #[test]
    fn test_process_data_empty_input() {
        let result = process_data("");
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("empty"));
    }

    #[test]
    fn test_validate_input_valid() {
        assert!(validate_input("valid"));
    }

    #[test]
    fn test_validate_input_empty() {
        assert!(!validate_input(""));
    }

    #[test]
    fn test_validate_input_too_long() {
        let long_input = "a".repeat(101);
        assert!(!validate_input(&long_input));
    }
}
```

#### Rust Async Tests (with Tokio)

```rust
#[cfg(test)]
#[allow(clippy::unwrap_used)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_async_operation() {
        let result = async_function().await;
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_with_timeout() {
        let result = tokio::time::timeout(
            std::time::Duration::from_secs(5),
            async_function()
        ).await;
        assert!(result.is_ok());
    }
}
```

## Test Coverage Checklist

For each function/method, test:

- [ ] **Happy path** - Normal successful execution
- [ ] **Edge cases** - Empty inputs, boundary values, null/undefined
- [ ] **Error handling** - Expected errors are thrown/caught correctly
- [ ] **Side effects** - Verify mocks were called with correct arguments

## Running Tests

### TypeScript (Backend & Frontend)

```bash
# Run all tests
npm run test

# Run specific project
npx nx test @noverlink/backend
npx nx test @noverlink/frontend

# Run specific test file
npx nx test @noverlink/backend -- --testNamePattern="BillingService"

# Run with coverage
npx nx test @noverlink/backend --coverage
```

### Rust (relay & cli)

```bash
# Run all Rust tests
cargo test -p relay
cargo test -p noverlink-cli

# Run specific test
cargo test -p relay test_valid_ticket

# Run tests with output
cargo test -p relay -- --nocapture

# Run tests in release mode (faster, but no debug info)
cargo test -p relay --release
```

## File Naming

### TypeScript
- Test files: `*.spec.ts` or `*.spec.tsx`
- Located alongside source files (not in separate `__tests__` folder)
- Example: `billing.service.ts` -> `billing.service.spec.ts`

### Rust
- Tests are inline in the same file using `#[cfg(test)]` module
- Place test module at the bottom of the source file
- Example: `ticket.rs` contains both code and `mod tests { ... }`

## Common Gotchas

### TypeScript (Jest)

1. **Always mock Logger** - Suppress output during tests
2. **Use `jest.restoreAllMocks()` in afterEach** - Clean up spies
3. **Mock external dependencies** - Don't make real API calls
4. **Test async code properly** - Use `async/await` with `expect().rejects`
5. **Mock Next.js modules** - `next/link`, `next/navigation`, `next/image`
6. **Override guards in controller tests** - Use `.overrideGuard(Guard).useValue({ canActivate: () => true })`

### Rust

1. **Use `#[allow(clippy::unwrap_used)]`** - Allow `.unwrap()` in test code
2. **Use `#[tokio::test]`** - For async test functions
3. **Keep tests in same file** - Use `#[cfg(test)] mod tests { ... }`
4. **Import parent module** - Use `use super::*;` in test module
5. **Test error messages** - Use `result.unwrap_err().to_string().contains("expected")`
6. **Mock time carefully** - Consider using `tokio::time::pause()` for time-dependent tests
