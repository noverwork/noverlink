/**
 * Tests for require-ref-for-relations ESLint rule
 */

import { RuleTester } from 'eslint';
import rule from './require-ref-for-relations.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    parser: await import('@typescript-eslint/parser'),
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
});

ruleTester.run('require-ref-for-relations', rule, {
  valid: [
    {
      name: '@ManyToOne with ref: true and Ref<> type',
      code: `
        class Meeting {
          @ManyToOne(() => User, { ref: true })
          organizer!: Ref<User>;
        }
      `,
    },
    {
      name: '@ManyToOne with ref: true and additional options',
      code: `
        class Meeting {
          @ManyToOne(() => User, { ref: true, deleteRule: 'CASCADE' })
          organizer!: Ref<User>;
        }
      `,
    },
    {
      name: '@OneToOne with ref: true and Ref<> type',
      code: `
        class Meeting {
          @OneToOne(() => MeetingReport, { ref: true, mappedBy: 'meeting' })
          report?: Ref<MeetingReport>;
        }
      `,
    },
    {
      name: '@OneToMany should not require Ref<> (uses Collection)',
      code: `
        class Meeting {
          @OneToMany(() => MeetingAttendee, (attendee) => attendee.meeting)
          attendees = new Collection<MeetingAttendee>(this);
        }
      `,
    },
    {
      name: 'Regular property without decorator',
      code: `
        class Meeting {
          @Property()
          subject!: string;
        }
      `,
    },
    {
      name: 'Optional @ManyToOne with ref: true',
      code: `
        class Meeting {
          @ManyToOne(() => User, { ref: true, nullable: true })
          organizer?: Ref<User>;
        }
      `,
    },
  ],

  invalid: [
    {
      name: '@ManyToOne without ref: true option',
      code: `
        class Meeting {
          @ManyToOne(() => User)
          organizer!: Ref<User>;
        }
      `,
      errors: [{ messageId: 'missingRefOption' }],
    },
    {
      name: '@ManyToOne with ref: false',
      code: `
        class Meeting {
          @ManyToOne(() => User, { ref: false })
          organizer!: Ref<User>;
        }
      `,
      errors: [{ messageId: 'missingRefOption' }],
    },
    {
      name: '@ManyToOne without Ref<> type',
      code: `
        class Meeting {
          @ManyToOne(() => User, { ref: true })
          organizer!: User;
        }
      `,
      errors: [{ messageId: 'missingRefType' }],
    },
    {
      name: '@ManyToOne missing both ref: true and Ref<> type',
      code: `
        class Meeting {
          @ManyToOne(() => User)
          organizer!: User;
        }
      `,
      errors: [{ messageId: 'missingRefOption' }, { messageId: 'missingRefType' }],
    },
    {
      name: '@OneToOne without ref: true option',
      code: `
        class Meeting {
          @OneToOne(() => MeetingReport, { mappedBy: 'meeting' })
          report?: Ref<MeetingReport>;
        }
      `,
      errors: [{ messageId: 'missingRefOption' }],
    },
    {
      name: '@OneToOne without Ref<> type',
      code: `
        class Meeting {
          @OneToOne(() => MeetingReport, { ref: true })
          report?: MeetingReport;
        }
      `,
      errors: [{ messageId: 'missingRefType' }],
    },
  ],
});

console.log('All tests passed!');
