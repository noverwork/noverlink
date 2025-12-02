import { MigrationObject } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import { ClassConstructor } from 'class-transformer';

import { Migration20251202153423_InitSchema } from './Migration20251202153423_InitSchema';

// Migration classes - add new migrations here in chronological order
const migrationClasses: ClassConstructor<Migration>[] = [
  Migration20251202153423_InitSchema,
];

export const migrationsList: MigrationObject[] = migrationClasses.map(
  (migrationClass) => ({ name: migrationClass.name, class: migrationClass })
);
