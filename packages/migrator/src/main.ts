import 'reflect-metadata';

import { MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Environment } from '@noverlink/shared';

import { MIGRATION_ROOT } from './constant';
import MikroOrmConfig from './mikro-orm.config';
import { DevUserSeeder, PlanSeeder } from './seeders';

// Logger for CLI output - console is appropriate here
const log = {
  error: (...args: unknown[]) => process.stderr.write(args.join(' ') + '\n'),
};

export const createMigrations = async (name: string) => {
  const orm = await MikroORM.init<PostgreSqlDriver>({ ...MikroOrmConfig });
  const migrator = orm.getMigrator();
  await migrator.createMigration(MIGRATION_ROOT, false, false, name);
  await orm.close();
};

export const up = async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>({ ...MikroOrmConfig });
  const migrator = orm.getMigrator();
  await migrator.up();
  // Seed after migrations
  const seeder = orm.getSeeder();
  await seeder.seed(PlanSeeder);
  await orm.close();
};

export const down = async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>({ ...MikroOrmConfig });
  const migrator = orm.getMigrator();
  await migrator.down();
  await orm.close();
};

export const refreshSchema = async () => {
  if (
    process.env.NODE_ENV === Environment.Production &&
    process.env.ENABLE_REFRESH === 'false'
  ) {
    throw new Error(
      'The action cannot be performed in production environment.'
    );
  }
  const orm = await MikroORM.init<PostgreSqlDriver>({ ...MikroOrmConfig });
  const generator = orm.getSchemaGenerator();

  await generator.refreshDatabase();

  await orm.close(true);
};

export const seed = async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>({ ...MikroOrmConfig });
  const seeder = orm.getSeeder();
  await seeder.seed(PlanSeeder);
  await seeder.seed(DevUserSeeder);
  await orm.close();
};

// Get command from environment variable or command line argument
const command = process.env.MIGRATOR_COMMAND || process.argv[2];

if (command === 'create') {
  const migrationName = process.argv[3] || process.env.MIGRATION_NAME;
  if (!migrationName) {
    log.error('Error: Migration name required for create command');
    process.exit(1);
  }
  void createMigrations(migrationName);
} else if (command === 'up') {
  void up();
} else if (command === 'down') {
  void down();
} else if (command === 'refresh') {
  void refreshSchema();
} else if (command === 'seed') {
  void seed();
} else if (command) {
  log.error(
    `Error: Invalid command '${command}'. Valid commands: up, down, refresh, create <name>, seed`
  );
  log.error(
    `Command can be set via MIGRATOR_COMMAND environment variable or as argument`
  );
  process.exit(1);
}
