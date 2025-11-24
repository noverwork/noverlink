import { defineConfig } from '@mikro-orm/core';
import { Migrator } from '@mikro-orm/migrations';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { SeedManager } from '@mikro-orm/seeder';
import { ENTITIES } from '@noverlink/backend-shared';
import dotenv from 'dotenv';
import path from 'path';

import { MIGRATION_ROOT, PROJECT_ROOT } from './constant';
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
    path: MIGRATION_ROOT, // path to the folder with migrations
    migrationsList,
    transactional: true, // wrap each migration in a transaction
    disableForeignKeys: true, // wrap statements with `set foreign_key_checks = 0` or equivalent
    allOrNothing: true, // wrap all migrations in master transaction
    dropTables: true, // allow to disable table dropping
    safe: false, // allow to disable table and column dropping
    snapshot: false, // save snapshot when creating new migrations
    emit: 'ts', // migration generation mode
  },
  seeder: {
    // path: SEEDER_ROOT, // path to the folder with seeders
    emit: 'ts', // seeder generation mode
    fileName: (className: string) => className, // seeder file naming convention
  },
});
export default config;
