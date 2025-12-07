import { defineConfig } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { ENTITIES } from '@noverlink/backend-shared';
import dotenv from 'dotenv';
import path from 'path';

import { MIGRATION_ROOT, PROJECT_ROOT, SEEDER_ROOT } from './constant';
import { migrationsList } from './migrations';

dotenv.config({
  path: path.resolve(PROJECT_ROOT, `.env.local`),
});
dotenv.config({
  path: path.resolve(PROJECT_ROOT, `.env`),
});
const config = defineConfig({
  debug: true,
  extensions: [Migrator, SeedManager],
  driver: PostgreSqlDriver,
  entities: ENTITIES,
  clientUrl: process.env.DB_CLIENT_URL,
  driverOptions: {
    connection: {
      ssl: process.env.DB_SSL === 'true',
    },
  },
  migrations: {
    path: MIGRATION_ROOT,
    migrationsList,
    transactional: true,
    disableForeignKeys: true,
    allOrNothing: true,
    dropTables: true,
    safe: false,
    snapshot: false,
    emit: 'ts',
  },
  seeder: {
    path: SEEDER_ROOT,
    defaultSeeder: 'PlanSeeder',
    emit: 'ts',
    fileName: (className: string) => className,
  },
});
export default config;
