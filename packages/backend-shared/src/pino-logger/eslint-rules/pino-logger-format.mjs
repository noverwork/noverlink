/**
 * ESLint rule to enforce pino-style logging format: object first, message second
 *
 * Correct usage:
 *   this.logger.info({ userId, action }, 'User performed action');
 *   this.logger.error({ error, context }, 'Operation failed');
 *
 * Incorrect usage:
 *   this.logger.info('User performed action', { userId });  // message first
 *   this.logger.info(`Processing ${id}`);                   // string interpolation
 */

const LOGGER_METHODS = [
  'log',
  'debug',
  'info',
  'warn',
  'error',
  'verbose',
  'fatal',
  'trace',
];

/**
 * Check if a node is a string (Literal string or TemplateLiteral)
 */
function isStringNode(node) {
  if (!node) return false;
  if (node.type === 'Literal' && typeof node.value === 'string') return true;
  if (node.type === 'TemplateLiteral') return true;
  return false;
}

/**
 * Check if a node is an object (ObjectExpression, Identifier, or MemberExpression)
 */
function isObjectNode(node) {
  if (!node) return false;
  if (node.type === 'ObjectExpression') return true;
  if (node.type === 'Identifier') return true;
  if (node.type === 'MemberExpression') return true;
  return false;
}

/**
 * Check if node is a logger call (this.logger.method or logger.method)
 */
function isLoggerCall(node) {
  if (node.callee.type !== 'MemberExpression') return false;

  const { object, property } = node.callee;

  // Check if method is a logger method
  if (
    property.type !== 'Identifier' ||
    !LOGGER_METHODS.includes(property.name)
  ) {
    return false;
  }

  // Check for this.logger.method pattern
  if (
    object.type === 'MemberExpression' &&
    object.property.type === 'Identifier' &&
    object.property.name === 'logger'
  ) {
    return true;
  }

  // Check for logger.method pattern (direct logger variable)
  if (object.type === 'Identifier' && object.name === 'logger') {
    return true;
  }

  return false;
}

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce pino-style logging format: object first, message second',
      category: 'Logging',
      recommended: true,
    },
    fixable: null,
    schema: [],
    messages: {
      wrongOrder:
        'Logger calls must use pino style: object first, message second. Use: this.logger.{{method}}({ field }, "message") instead of this.logger.{{method}}("message", { field })',
      useStructuredLogging:
        'Avoid string interpolation in logs. Use structured logging: this.logger.{{method}}({ variable }, "message") instead of template literals',
      missingContext:
        'Logger calls with 2+ args should have object context first. Use: this.logger.{{method}}({ field }, "message")',
    },
  },

  create(context) {
    return {
      CallExpression(node) {
        if (!isLoggerCall(node)) return;

        const methodName = node.callee.property.name;
        const args = node.arguments;

        // Single argument cases
        if (args.length === 1) {
          const firstArg = args[0];

          // Template literal with expressions = string interpolation (bad)
          if (
            firstArg.type === 'TemplateLiteral' &&
            firstArg.expressions.length > 0
          ) {
            context.report({
              node,
              messageId: 'useStructuredLogging',
              data: { method: methodName },
            });
          }
          // Single string literal is OK (simple message)
          // Single object is OK (context only, rare but valid)
          return;
        }

        // Two or more arguments - check order
        if (args.length >= 2) {
          const firstArg = args[0];
          const secondArg = args[1];

          // If first arg is a string and second is object/identifier = wrong order
          if (isStringNode(firstArg) && isObjectNode(secondArg)) {
            context.report({
              node,
              messageId: 'wrongOrder',
              data: { method: methodName },
            });
            return;
          }

          // If first arg is object and second is string = correct (pino style)
          if (isObjectNode(firstArg) && isStringNode(secondArg)) {
            return; // Correct usage
          }

          // If first arg is string with interpolation
          if (
            firstArg.type === 'TemplateLiteral' &&
            firstArg.expressions.length > 0
          ) {
            context.report({
              node,
              messageId: 'useStructuredLogging',
              data: { method: methodName },
            });
            return;
          }
        }
      },
    };
  },
};
