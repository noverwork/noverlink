/**
 * ESLint rule to prohibit usage of Reference.getEntity()
 *
 * getEntity() throws at runtime if the entity is not initialized.
 * Use populate + $ for type-safe access, or load() for async loading.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow Reference.getEntity() usage in MikroORM',
      category: 'MikroORM',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noGetEntity:
        'Avoid getEntity() - it throws if not initialized. Use populate + $ for type-safe access, or load() for async loading.',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'getEntity'
        ) {
          context.report({
            node,
            messageId: 'noGetEntity',
          });
        }
      },
    };
  },
};
