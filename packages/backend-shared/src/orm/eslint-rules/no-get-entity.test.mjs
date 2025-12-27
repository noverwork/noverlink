/**
 * Tests for no-get-entity ESLint rule
 */

import { RuleTester } from 'eslint';
import rule from './no-get-entity.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: await import('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('no-get-entity', rule, {
  valid: [
    {
      name: 'Using $ for type-safe access',
      code: `
        const book = await em.findOne(Book, 1, { populate: ['author'] });
        console.log(book.author.$.name);
      `,
    },
    {
      name: 'Using load() for async loading',
      code: `
        const book = await em.findOne(Book, 1);
        const author = await book.author.load();
        console.log(author.name);
      `,
    },
  ],

  invalid: [
    {
      name: 'Direct getEntity() call',
      code: `
        const book = await em.findOne(Book, 1);
        const author = book.author.getEntity();
      `,
      errors: [{ messageId: 'noGetEntity' }],
    },
    {
      name: 'getEntity() in chained call',
      code: `
        console.log(book.author.getEntity().name);
      `,
      errors: [{ messageId: 'noGetEntity' }],
    },
    {
      name: 'Direct unwrap() call',
      code: `
        const book = await em.findOne(Book, 1);
        const author = book.author.unwrap();
      `,
      errors: [{ messageId: 'noUnwrap' }],
    },
    {
      name: 'unwrap() in chained call',
      code: `
        console.log(book.author.unwrap()?.name);
      `,
      errors: [{ messageId: 'noUnwrap' }],
    },
  ],
});

console.log('All tests passed!');
