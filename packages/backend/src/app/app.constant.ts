import path from 'path';

export const SERVICE_NAME = 'backend';

export const PROJECT_ROOT = path.resolve(
  process.cwd(),
  'packages',
  SERVICE_NAME
);
