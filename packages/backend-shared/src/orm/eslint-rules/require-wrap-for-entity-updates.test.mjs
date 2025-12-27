/**
 * Tests for require-wrap-for-entity-updates rule
 */

import { RuleTester } from 'eslint';
import requireWrapForEntityUpdates from './require-wrap-for-entity-updates.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

ruleTester.run('require-wrap-for-entity-updates', requireWrapForEntityUpdates, {
  valid: [
    // Using wrap().assign() is correct
    {
      code: `wrap(existingEntity).assign({ property: value });`,
    },
    {
      code: `wrap(existingAttendee).assign({ msGraphEventId: eventId });`,
    },
    {
      code: `
        if (existingAttendee && !existingAttendee.msGraphEventId) {
          wrap(existingAttendee).assign({ msGraphEventId: syncingUserEventId });
        }
      `,
    },
    // Multiple properties in wrap().assign() is correct
    {
      code: `wrap(loadedEntity).assign({ prop1: value1, prop2: value2 });`,
    },
    // Assignments to non-entity objects are ignored
    {
      code: `window.location = newLocation;`,
    },
    {
      code: `global.config = config;`,
    },
    // Simple variable assignments are ignored
    {
      code: `let value = 10; value = 20;`,
    },
    // Non-entity like variables are ignored (new entities)
    {
      code: `result.identifier = parts[5];`,
    },
    {
      code: `obj.name = 'test';`,
    },
    // NEW entities can be assigned directly (no existing/loaded/found prefix)
    {
      code: `attendee.msGraphEventId = eventId;`,
    },
    {
      code: `record.file = ref(driveFile);`,
    },
    {
      code: `meeting.subject = 'New Subject';`,
    },
    {
      code: `entity.property = value;`,
    },
  ],

  invalid: [
    // Direct property assignment to LOADED entity - SHOULD FAIL
    {
      code: `existingAttendee.msGraphEventId = syncingUserEventId;`,
      errors: [
        {
          messageId: 'requireWrapAssign',
          type: 'AssignmentExpression',
        },
      ],
    },
    // Loaded entity - SHOULD FAIL
    {
      code: `loadedUser.email = newEmail;`,
      errors: [
        {
          messageId: 'requireWrapAssign',
          type: 'AssignmentExpression',
        },
      ],
    },
    // In an if block - SHOULD FAIL
    {
      code: `
        if (existingAttendee && !existingAttendee.msGraphEventId) {
          existingAttendee.msGraphEventId = syncingUserEventId;
        }
      `,
      errors: [
        {
          messageId: 'requireWrapAssign',
          type: 'AssignmentExpression',
        },
      ],
    },
    // Found entity - SHOULD FAIL
    {
      code: `foundUser.email = newEmail;`,
      errors: [
        {
          messageId: 'requireWrapAssign',
          type: 'AssignmentExpression',
        },
      ],
    },
    // DB entity - SHOULD FAIL
    {
      code: `dbMeeting.subject = 'New Subject';`,
      errors: [
        {
          messageId: 'requireWrapAssign',
          type: 'AssignmentExpression',
        },
      ],
    },
    // Current entity - SHOULD FAIL
    {
      code: `currentUser.name = 'New Name';`,
      errors: [
        {
          messageId: 'requireWrapAssign',
          type: 'AssignmentExpression',
        },
      ],
    },
  ],
});

console.log('All tests passed!');
