import { MigrationObject } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import { ClassConstructor } from 'class-transformer';

// Migration classes will be added here as they are created
 
const migrationClasses: ClassConstructor<Migration>[] = [];

// eslint-disable-next-line sonarjs/no-empty-collection -- Uses migrationClasses above
export const migrationsList: MigrationObject[] = migrationClasses.map(
  (migrationClass) => ({ name: migrationClass.name, class: migrationClass })
);
