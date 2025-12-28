import { MigrationObject } from '@mikro-orm/core';
import { Migration } from '@mikro-orm/migrations';
import { ClassConstructor } from 'class-transformer';

import { Migration20251207173426_InitSchema } from './Migration20251207173426_InitSchema';
import { Migration20251227183315_AddLastSeenAtToTunnelSession } from './Migration20251227183315_AddLastSeenAtToTunnelSession';
import { Migration20251228055653_ChangeHostnameUniqueToCompositeWithBaseDomain } from './Migration20251228055653_ChangeHostnameUniqueToCompositeWithBaseDomain';

// Migration classes - add new migrations here in chronological order
const migrationClasses: ClassConstructor<Migration>[] = [
  Migration20251207173426_InitSchema,
  Migration20251227183315_AddLastSeenAtToTunnelSession,
  Migration20251228055653_ChangeHostnameUniqueToCompositeWithBaseDomain,
];

export const migrationsList: MigrationObject[] = migrationClasses.map(
  (migrationClass) => ({ name: migrationClass.name, class: migrationClass })
);
