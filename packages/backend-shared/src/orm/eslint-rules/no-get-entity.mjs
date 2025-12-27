/**
 * ESLint rule to prohibit usage of Reference.getEntity() and Reference.unwrap()
 *
 * Both methods are unsafe because they don't guarantee the relation is loaded:
 * - getEntity() throws at runtime if the entity is not initialized
 * - unwrap() returns undefined if the entity is not initialized
 *
 * Use populate + $ for type-safe access, or load() for async loading.
 */

const UNSAFE_METHODS = ['getEntity', 'unwrap'];

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow Reference.getEntity() and Reference.unwrap() usage in MikroORM',
      category: 'MikroORM',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noGetEntity:
        'Avoid getEntity() - it throws if not initialized. Use populate + $ for type-safe access, or load() for async loading.',
      noUnwrap:
        'Avoid unwrap() - it returns undefined if not initialized. Use populate + $ for type-safe access, or load() for async loading.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          UNSAFE_METHODS.includes(node.callee.property.name)
        ) {
          const methodName = node.callee.property.name;
          context.report({
            node,
            messageId: methodName === 'getEntity' ? 'noGetEntity' : 'noUnwrap',
          });
        }
      },
    };
  },
};
