import { MigrationObject } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import { ClassConstructor } from 'class-transformer';

const migrationClasses: ClassConstructor<Migration>[] = [];

export const migrationsList: MigrationObject[] = migrationClasses.map(
  (migrationClass) => ({ name: migrationClass.name, class: migrationClass })
);
