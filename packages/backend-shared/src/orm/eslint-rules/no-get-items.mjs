/**
 * ESLint rule to prohibit usage of Collection.getItems()
 *
 * getItems() loses the `Loaded` type information that is preserved
 * when using Collection.$ accessor. This can lead to type errors
 * when accessing nested relations.
 *
 * Use collection.$ instead of collection.getItems() to preserve
 * the Loaded type chain.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow Collection.getItems() usage in MikroORM',
      category: 'MikroORM',
      recommended: true,
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      noGetItems:
        'Avoid getItems() - it loses Loaded type information. Use [...collection.$] to convert to array while preserving the Loaded type chain.',
      useDollarAccessor: 'Replace with [...collection.$]',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.property.type === 'Identifier' &&
          node.callee.property.name === 'getItems'
        ) {
          const objectNode = node.callee.object;
          const sourceCode = context.getSourceCode();
          const objectText = sourceCode.getText(objectNode);

          context.report({
            node,
            messageId: 'noGetItems',
            suggest: [
              {
                messageId: 'useDollarAccessor',
                fix(fixer) {
                  return fixer.replaceText(node, `[...${objectText}.$]`);
                },
              },
            ],
          });
        }
      },
    };
  },
};
