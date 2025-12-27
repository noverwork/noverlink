/**
 * ESLint rule to prohibit direct property assignment to MikroORM entities
 *
 * MikroORM v6 best practices:
 * - New entities: use repo.create({ ... }) or em.create(Entity, { ... })
 * - Update entities: use wrap(entity).assign({ ... })
 *
 * Direct property assignment (entity.prop = value) is prohibited because:
 * 1. For loaded entities: breaks change tracking
 * 2. For new entities: inconsistent with best practices
 *
 * Detection: Checks if the class is imported from '@truley-companion/backend-shared'
 */

// Package that contains MikroORM entities
const ENTITY_PACKAGE = '@truley-companion/backend-shared';

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Prohibit direct property assignment to MikroORM entities. Use repo.create() for new entities or wrap().assign() for updates.',
      category: 'MikroORM',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      noDirectAssignment:
        'Direct entity property assignment is prohibited. For new entities use repo.create({ ... }), for updates use wrap(entity).assign({ ... }).',
    },
  },

  create(context) {
    // Track classes imported from backend-shared (these are entities)
    const entityClasses = new Set();

    // Track variables that are instances of entity classes
    const entityVariables = new Map(); // variableName -> className

    return {
      // Track imports from backend-shared
      ImportDeclaration(node) {
        if (node.source.value === ENTITY_PACKAGE) {
          node.specifiers.forEach((specifier) => {
            if (specifier.type === 'ImportSpecifier') {
              const name = specifier.local.name;
              // Only track classes that look like entities (PascalCase, not ending with Repository/Service)
              if (
                /^[A-Z]/.test(name) &&
                !name.endsWith('Repository') &&
                !name.endsWith('Service') &&
                !name.endsWith('Module') &&
                !name.endsWith('Guard') &&
                !name.endsWith('Decorator') &&
                !name.endsWith('Exception') &&
                !name.endsWith('Error') &&
                !name.endsWith('Type') &&
                !name.endsWith('Enum') &&
                !name.endsWith('Interface') &&
                !name.endsWith('Dto') &&
                !name.endsWith('Config') &&
                !name.endsWith('Options') &&
                !name.endsWith('Activity') &&
                !name.endsWith('Queue')
              ) {
                entityClasses.add(name);
              }
            }
          });
        }
      },

      // Track `new EntityClass()` assignments
      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.type === 'NewExpression' &&
          node.init.callee &&
          node.init.callee.type === 'Identifier' &&
          node.id &&
          node.id.type === 'Identifier'
        ) {
          const className = node.init.callee.name;
          if (entityClasses.has(className)) {
            entityVariables.set(node.id.name, className);
          }
        }
      },

      AssignmentExpression(node) {
        // Only check assignments to object properties (e.g., entity.property = value)
        if (node.left.type !== 'MemberExpression') {
          return;
        }

        // Get the object being assigned to
        const obj = node.left.object;
        if (obj.type !== 'Identifier') {
          return;
        }

        const objName = obj.name;

        // Check if this is a known entity variable
        if (!entityVariables.has(objName)) {
          return;
        }

        // Check if inside wrap().assign() - that's allowed
        let parent = node.parent;
        let depth = 0;
        const maxDepth = 5;

        while (parent && depth < maxDepth) {
          if (
            parent.type === 'ObjectExpression' &&
            parent.parent &&
            parent.parent.type === 'CallExpression' &&
            parent.parent.callee &&
            parent.parent.callee.type === 'MemberExpression' &&
            parent.parent.callee.property &&
            parent.parent.callee.property.name === 'assign'
          ) {
            return; // Inside wrap().assign(), OK
          }
          parent = parent.parent;
          depth++;
        }

        // Report error
        context.report({
          node,
          messageId: 'noDirectAssignment',
        });
      },
    };
  },
};
