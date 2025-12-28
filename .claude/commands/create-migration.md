Compare all DB entity definitions in the current branch with those in origin/main.
Identify any schema differences (e.g., new entities, dropped entities, modified columns, changed constraints or indexes).

If differences require a database migration, generate a descriptive migration name in CamelCase
that clearly reflects the schema change (e.g., AddUserTable, RenameOrderStatusColumn, DropLegacyIndex).

Then, in bash, execute the migration workflow:

1. npm run migrator:create -- <YourMigrationName>
2. append the generated migration class name to the migrationClasses `packages/migrator/src/migrations/index.ts`

If there are no DB entity differences that require migration, respond only with "no migration needed".
