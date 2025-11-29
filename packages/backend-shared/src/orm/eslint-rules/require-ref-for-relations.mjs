/**
 * ESLint rule to ensure MikroORM relations use Ref<> wrapper
 *
 * For @ManyToOne and @OneToOne decorators:
 * - Must have { ref: true } option
 * - Property type must be Ref<Entity>
 *
 * This ensures consistent lazy-loading behavior and type safety.
 */

const RELATION_DECORATORS = ['ManyToOne', 'OneToOne'];

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure MikroORM @ManyToOne and @OneToOne relations use Ref<> wrapper',
      category: 'MikroORM',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      missingRefOption:
        '@{{decorator}} on "{{property}}" must have { ref: true } option. Add ref: true to the decorator options.',
      missingRefType:
        '@{{decorator}} property "{{property}}" must use Ref<{{entityType}}> type instead of {{actualType}}.',
    },
  },

  create(context) {
    /**
     * Check if a property has a specific relation decorator
     */
    function getRelationDecorator(node) {
      if (!node.decorators) return null;

      for (const decorator of node.decorators) {
        let decoratorName = null;

        if (decorator.expression.type === 'CallExpression') {
          const callee = decorator.expression.callee;
          if (callee.type === 'Identifier') {
            decoratorName = callee.name;
          }
        } else if (decorator.expression.type === 'Identifier') {
          decoratorName = decorator.expression.name;
        }

        if (decoratorName && RELATION_DECORATORS.includes(decoratorName)) {
          return { decorator, name: decoratorName };
        }
      }

      return null;
    }

    /**
     * Check if decorator has ref: true option
     */
    function hasRefTrueOption(decorator) {
      if (decorator.expression.type !== 'CallExpression') {
        return false;
      }

      const args = decorator.expression.arguments;

      // Look for options object (usually 2nd or 3rd argument)
      for (const arg of args) {
        if (arg.type === 'ObjectExpression') {
          for (const prop of arg.properties) {
            if (
              prop.type === 'Property' &&
              prop.key.type === 'Identifier' &&
              prop.key.name === 'ref' &&
              prop.value.type === 'Literal' &&
              prop.value.value === true
            ) {
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * Get property name
     */
    function getPropertyName(node) {
      if (node.key && node.key.type === 'Identifier') {
        return node.key.name;
      }
      return '<unknown>';
    }

    /**
     * Check if type annotation is Ref<T>
     */
    function isRefType(typeAnnotation) {
      if (!typeAnnotation) return false;

      const type = typeAnnotation.typeAnnotation;
      if (!type) return false;

      // Handle Ref<Entity>
      if (
        type.type === 'TSTypeReference' &&
        type.typeName &&
        type.typeName.type === 'Identifier' &&
        type.typeName.name === 'Ref'
      ) {
        return true;
      }

      // Handle optional Ref<Entity> (Ref<Entity> | undefined or ?: Ref<Entity>)
      if (type.type === 'TSUnionType') {
        return type.types.some(
          (t) =>
            t.type === 'TSTypeReference' &&
            t.typeName &&
            t.typeName.type === 'Identifier' &&
            t.typeName.name === 'Ref'
        );
      }

      return false;
    }

    /**
     * Get the actual type string for error message
     */
    function getActualType(typeAnnotation) {
      if (!typeAnnotation || !typeAnnotation.typeAnnotation) {
        return 'untyped';
      }

      const type = typeAnnotation.typeAnnotation;

      if (type.type === 'TSTypeReference' && type.typeName) {
        if (type.typeName.type === 'Identifier') {
          return type.typeName.name;
        }
      }

      if (type.type === 'TSUnionType') {
        return 'union type';
      }

      return 'unknown type';
    }

    /**
     * Get the entity type from decorator for error message
     */
    function getEntityTypeFromDecorator(decorator) {
      if (decorator.expression.type !== 'CallExpression') {
        return 'Entity';
      }

      const firstArg = decorator.expression.arguments[0];

      // Handle () => Entity arrow function
      if (firstArg && firstArg.type === 'ArrowFunctionExpression') {
        const body = firstArg.body;
        if (body.type === 'Identifier') {
          return body.name;
        }
      }

      // Handle direct Entity reference
      if (firstArg && firstArg.type === 'Identifier') {
        return firstArg.name;
      }

      return 'Entity';
    }

    return {
      PropertyDefinition(node) {
        const relation = getRelationDecorator(node);

        if (!relation) {
          return;
        }

        const propertyName = getPropertyName(node);
        const entityType = getEntityTypeFromDecorator(relation.decorator);

        // Check for ref: true option
        if (!hasRefTrueOption(relation.decorator)) {
          context.report({
            node: relation.decorator,
            messageId: 'missingRefOption',
            data: {
              decorator: relation.name,
              property: propertyName,
            },
          });
        }

        // Check for Ref<> type
        if (!isRefType(node.typeAnnotation)) {
          context.report({
            node: node.key,
            messageId: 'missingRefType',
            data: {
              decorator: relation.name,
              property: propertyName,
              entityType,
              actualType: getActualType(node.typeAnnotation),
            },
          });
        }
      },
    };
  },
};
