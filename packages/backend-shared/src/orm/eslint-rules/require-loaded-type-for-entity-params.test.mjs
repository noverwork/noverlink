/**
 * Tests for require-loaded-type-for-entity-params ESLint rule
 */

import { RuleTester } from 'eslint';
import rule from './require-loaded-type-for-entity-params.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: await import('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('require-loaded-type-for-entity-params', rule, {
  valid: [
    {
      name: 'Function with Loaded<Chat, ...> parameter',
      code: `
        function processChat(chat: Loaded<Chat, 'user'>) {
          console.log(chat.user.$.name);
        }
      `,
    },
    {
      name: 'Arrow function with Loaded<User, ...> parameter',
      code: `
        const processUser = (user: Loaded<User, 'tenant'>) => {
          console.log(user.tenant.$.id);
        };
      `,
    },
    {
      name: 'Method with Loaded<Meeting, ...> parameter',
      code: `
        class MeetingService {
          process(meeting: Loaded<Meeting, 'organizer' | 'attendees'>) {
            return meeting.organizer.$.name;
          }
        }
      `,
    },
    {
      name: 'Non-entity type should be allowed',
      code: `
        function processData(data: SomeOtherType) {
          return data;
        }
      `,
    },
    {
      name: 'Primitive types should be allowed',
      code: `
        function processId(id: string, count: number) {
          return id + count;
        }
      `,
    },
    {
      name: 'Multiple parameters with Loaded types',
      code: `
        function processMultiple(
          chat: Loaded<Chat, 'messages'>,
          user: Loaded<User, 'tenant'>
        ) {
          return { chat, user };
        }
      `,
    },
    {
      name: 'Loaded with nested populate hints',
      code: `
        function processChat(chat: Loaded<Chat, 'user.tenant'>) {
          return chat.user.$.tenant.$.id;
        }
      `,
    },
  ],

  invalid: [
    {
      name: 'Function with direct Chat type',
      code: `
        function processChat(chat: Chat) {
          console.log(chat.id);
        }
      `,
      errors: [{ messageId: 'requireLoadedType' }],
    },
    {
      name: 'Arrow function with direct User type',
      code: `
        const processUser = (user: User) => {
          return user.name;
        };
      `,
      errors: [{ messageId: 'requireLoadedType' }],
    },
    {
      name: 'Method with direct Meeting type',
      code: `
        class MeetingService {
          process(meeting: Meeting) {
            return meeting.subject;
          }
        }
      `,
      errors: [{ messageId: 'requireLoadedType' }],
    },
    {
      name: 'Multiple direct entity types',
      code: `
        function processMultiple(chat: Chat, user: User) {
          return { chat, user };
        }
      `,
      errors: [
        { messageId: 'requireLoadedType' },
        { messageId: 'requireLoadedType' },
      ],
    },
    {
      name: 'Mixed valid and invalid parameters',
      code: `
        function processMixed(
          id: string,
          chat: Chat,
          user: Loaded<User, 'tenant'>
        ) {
          return { id, chat, user };
        }
      `,
      errors: [{ messageId: 'requireLoadedType' }],
    },
    {
      name: 'Direct Tenant type',
      code: `
        function processTenant(tenant: Tenant) {
          return tenant.id;
        }
      `,
      errors: [{ messageId: 'requireLoadedType' }],
    },
    {
      name: 'Direct MeetingRecording type',
      code: `
        function processRecording(recording: MeetingRecording) {
          return recording.id;
        }
      `,
      errors: [{ messageId: 'requireLoadedType' }],
    },
  ],
});

console.log('All tests passed!');
