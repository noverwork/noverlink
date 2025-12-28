---
name: dependency-management
description: Dependency management rules for Nx monorepo. Use when adding packages, checking dependencies, or reviewing package.json files.
---

# Dependency Management

## Strategy: Single Version Policy

This project uses **centralized dependency management** - all third-party dependencies live in the root `package.json`.

## Rules

### Root `package.json`

All third-party dependencies go here:

```json
{
  "dependencies": {
    "@nestjs/common": "^11.0.0",
    "react": "19.0.0",
    // ... all external packages
  },
  "devDependencies": {
    "typescript": "~5.9.2",
    // ... all dev tools
  }
}
```

### Package-level `package.json`

Only internal workspace references:

```json
{
  "name": "@noverlink/backend",
  "dependencies": {
    "@noverlink/shared": "*",
    "@noverlink/backend-shared": "*"
  }
}
```

**Never** put third-party packages in individual package `package.json` files.

## Version Syntax for Internal Packages

| Syntax | Meaning |
|--------|---------|
| `"*"` | Always use local version (recommended) |
| `"^0.0.1"` | Semver range, but npm workspaces still symlinks locally |

Prefer `"*"` for simplicity.

## ESLint: @nx/dependency-checks

Since we use Single Version Policy, the `@nx/dependency-checks` rule should be **disabled** for internal (non-publishable) packages.

```js
// In packages/*/eslint.config.mjs for internal packages
{
  files: ['**/*.json'],
  rules: {
    '@nx/dependency-checks': 'off',
  },
}
```

This rule is designed for publishable libraries that need their own `package.json` dependencies. For internal packages using root dependencies, disable it per [Nx official recommendation](https://github.com/nrwl/nx/issues/19071).

## Why This Approach?

1. **No version conflicts** - All packages use the same React/NestJS/etc version
2. **Simpler upgrades** - Update once in root, affects everything
3. **Smaller lock file** - No duplicate entries
4. **Nx compatibility** - Works with `@nx/js:prune-lockfile` and `copy-workspace-modules`

## Checklist: Adding a New Dependency

1. [ ] Add to **root** `package.json` (not package-level)
2. [ ] Run `npm install` from root
3. [ ] Import in your code - it will resolve from root `node_modules`

## Checklist: Adding Internal Package Reference

1. [ ] Add `"@noverlink/<package>": "*"` to package's `dependencies`
2. [ ] Run `npm install` to create symlink
3. [ ] Import in your code

## Anti-patterns

```json
// BAD - Don't do this in packages/backend/package.json
{
  "dependencies": {
    "@noverlink/shared": "*",
    "@nestjs/common": "^11.0.0"  // Should be in root only
  }
}

// GOOD
{
  "dependencies": {
    "@noverlink/shared": "*"
  }
}
```

## Current Internal Packages

| Package | Name | Used By |
|---------|------|---------|
| packages/shared | @noverlink/shared | backend, frontend, migrator |
| packages/backend-shared | @noverlink/backend-shared | backend |
| packages/ui-shared | @noverlink/ui-shared | frontend |
| packages/interfaces | @noverlink/interfaces | shared, backend, frontend |
