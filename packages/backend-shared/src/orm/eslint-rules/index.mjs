/**
 * MikroORM-specific ESLint rules for backend-shared
 *
 * These rules help maintain code quality and prevent common issues
 * when working with MikroORM entities and decorators.
 */

import ensureRequestContextRequiresEntityManager from './ensure-request-context-requires-entity-manager.mjs';

export default {
  rules: {
    'ensure-request-context-requires-entity-manager':
      ensureRequestContextRequiresEntityManager,
  },
};
