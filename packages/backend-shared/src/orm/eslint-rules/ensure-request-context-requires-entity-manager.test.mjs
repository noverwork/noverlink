/**
 * Tests for ensure-request-context-requires-entity-manager ESLint rule
 *
 * These tests verify that the rule correctly identifies classes that use
 * @EnsureRequestContext without having EntityManager injected.
 */

import { RuleTester } from 'eslint';
import rule from './ensure-request-context-requires-entity-manager.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: await import('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('ensure-request-context-requires-entity-manager', rule, {
  valid: [
    {
      name: 'Class with @EnsureRequestContext and EntityManager in constructor',
      code: `
        import { EnsureRequestContext, EntityManager } from '@mikro-orm/core';

        class MyHandler {
          constructor(
            private readonly em: EntityManager,
            private readonly someRepo: SomeRepository
          ) {}

          @EnsureRequestContext()
          async execute() {
            // implementation
          }
        }
      `,
    },
    {
      name: 'Class without @EnsureRequestContext (no EntityManager required)',
      code: `
        class MyHandler {
          constructor(
            private readonly someRepo: SomeRepository
          ) {}

          async execute() {
            // implementation
          }
        }
      `,
    },
    {
      name: 'Class with @EnsureRequestContext() with parentheses',
      code: `
        import { EnsureRequestContext, EntityManager } from '@mikro-orm/core';

        class MyHandler {
          constructor(
            private readonly em: EntityManager
          ) {}

          @EnsureRequestContext()
          async execute() {
            // implementation
          }
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'Class with @EnsureRequestContext but no EntityManager',
      code: `
        import { EnsureRequestContext } from '@mikro-orm/core';

        class MyHandler {
          constructor(
            private readonly someRepo: SomeRepository
          ) {}

          @EnsureRequestContext()
          async execute() {
            // implementation
          }
        }
      `,
      errors: [
        {
          messageId: 'missingEntityManager',
          data: {
            className: 'MyHandler',
          },
        },
      ],
    },
    {
      name: 'Class with @EnsureRequestContext but EntityManager not private',
      code: `
        import { EnsureRequestContext, EntityManager } from '@mikro-orm/core';

        class MyHandler {
          constructor(
            readonly em: EntityManager
          ) {}

          @EnsureRequestContext()
          async execute() {
            // implementation
          }
        }
      `,
      errors: [
        {
          messageId: 'missingEntityManager',
        },
      ],
    },
    {
      name: 'Class with @EnsureRequestContext but EntityManager not readonly',
      code: `
        import { EnsureRequestContext, EntityManager } from '@mikro-orm/core';

        class MyHandler {
          constructor(
            private em: EntityManager
          ) {}

          @EnsureRequestContext()
          async execute() {
            // implementation
          }
        }
      `,
      errors: [
        {
          messageId: 'missingEntityManager',
        },
      ],
    },
    {
      name: 'Class with @EnsureRequestContext but wrong parameter name',
      code: `
        import { EnsureRequestContext, EntityManager } from '@mikro-orm/core';

        class MyHandler {
          constructor(
            private readonly entityManager: EntityManager
          ) {}

          @EnsureRequestContext()
          async execute() {
            // implementation
          }
        }
      `,
      errors: [
        {
          messageId: 'missingEntityManager',
        },
      ],
    },
  ],
});

console.log('All tests passed!');
