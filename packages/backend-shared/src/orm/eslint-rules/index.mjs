/**
 * Custom ESLint rules for MikroORM
 *
 * These rules help maintain code quality and prevent common issues
 * when working with MikroORM entities and decorators.
 */

import ensureRequestContextRequiresEntityManager from './ensure-request-context-requires-entity-manager.mjs';
import noGetEntity from './no-get-entity.mjs';
import noGetItems from './no-get-items.mjs';
import requireRefForRelations from './require-ref-for-relations.mjs';
import requireLoadedTypeForEntityParams from './require-loaded-type-for-entity-params.mjs';
import requireWrapForEntityUpdates from './require-wrap-for-entity-updates.mjs';

export default {
  rules: {
    'ensure-request-context-requires-entity-manager':
      ensureRequestContextRequiresEntityManager,
    'no-get-entity': noGetEntity,
    'no-get-items': noGetItems,
    'require-ref-for-relations': requireRefForRelations,
    'require-loaded-type-for-entity-params': requireLoadedTypeForEntityParams,
    'require-wrap-for-entity-updates': requireWrapForEntityUpdates,
  },
};
