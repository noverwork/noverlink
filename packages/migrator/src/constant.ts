import path from 'path';

export const PROJECT_ROOT = path.resolve(process.cwd(), 'packages', 'migrator');

export const MIGRATION_ROOT = path.join(PROJECT_ROOT, 'src', 'migrations');
