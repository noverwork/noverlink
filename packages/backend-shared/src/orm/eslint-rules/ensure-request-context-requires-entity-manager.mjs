/**
 * ESLint rule to ensure classes using @EnsureRequestContext
 * have EntityManager injected in constructor
 *
 * This prevents runtime errors where @EnsureRequestContext decorator
 * cannot fork the EntityManager context because no EntityManager
 * instance is available.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure classes using @EnsureRequestContext have EntityManager injected',
      category: 'MikroORM',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingEntityManager:
        'Class "{{className}}" uses @EnsureRequestContext but does not have "private readonly em: EntityManager" in constructor. @EnsureRequestContext requires EntityManager to fork the context.',
    },
  },

  create(context) {
    /**
     * Check if a method has @EnsureRequestContext decorator
     */
    function hasEnsureRequestContextDecorator(node) {
      if (!node.decorators) return false;
      return node.decorators.some((decorator) => {
        if (decorator.expression.type === 'Identifier') {
          return decorator.expression.name === 'EnsureRequestContext';
        }
        if (decorator.expression.type === 'CallExpression') {
          return (
            decorator.expression.callee.type === 'Identifier' &&
            decorator.expression.callee.name === 'EnsureRequestContext'
          );
        }
        return false;
      });
    }

    /**
     * Check if constructor has EntityManager parameter
     * Pattern: private readonly em: EntityManager
     */
    function hasEntityManagerParameter(constructorNode) {
      if (!constructorNode || !constructorNode.value.params) {
        return false;
      }

      return constructorNode.value.params.some((param) => {
        // Handle parameter properties (private readonly em: EntityManager)
        if (param.type === 'TSParameterProperty') {
          const actualParam = param.parameter;

          // Check if parameter name is 'em'
          const isNamedEm =
            actualParam.type === 'Identifier' && actualParam.name === 'em';

          // Check if type annotation is EntityManager
          const hasEntityManagerType =
            actualParam.typeAnnotation &&
            actualParam.typeAnnotation.typeAnnotation &&
            actualParam.typeAnnotation.typeAnnotation.type ===
              'TSTypeReference' &&
            actualParam.typeAnnotation.typeAnnotation.typeName &&
            actualParam.typeAnnotation.typeAnnotation.typeName.name ===
              'EntityManager';

          // Check if it's readonly
          const isReadonly = param.readonly === true;

          // Check if it's private
          const isPrivate = param.accessibility === 'private';

          return isNamedEm && hasEntityManagerType && isReadonly && isPrivate;
        }

        return false;
      });
    }

    /**
     * Get class name for error reporting
     */
    function getClassName(node) {
      if (node.id && node.id.type === 'Identifier') {
        return node.id.name;
      }
      return '<anonymous>';
    }

    /**
     * Find constructor in class body
     */
    function findConstructor(classBody) {
      return classBody.body.find(
        (member) =>
          member.type === 'MethodDefinition' && member.kind === 'constructor'
      );
    }

    return {
      ClassDeclaration(node) {
        // Check if any method in the class has @EnsureRequestContext
        const methods = node.body.body.filter(
          (member) => member.type === 'MethodDefinition'
        );

        const hasEnsureRequestContext = methods.some((method) =>
          hasEnsureRequestContextDecorator(method)
        );

        if (!hasEnsureRequestContext) {
          return;
        }

        // Find constructor
        const constructor = findConstructor(node.body);

        // Check if constructor has EntityManager parameter
        if (!hasEntityManagerParameter(constructor)) {
          context.report({
            node: node.id || node,
            messageId: 'missingEntityManager',
            data: {
              className: getClassName(node),
            },
          });
        }
      },
    };
  },
};
