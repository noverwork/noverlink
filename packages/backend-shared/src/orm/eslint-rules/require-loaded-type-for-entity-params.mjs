/**
 * ESLint rule to ensure entity types in function parameters use Loaded<> wrapper
 *
 * When passing MikroORM entities as function parameters, use Loaded<Entity, ...>
 * to enforce type-safe access to populated relations.
 *
 * Bad:  function process(chat: Chat) { ... }
 * Good: function process(chat: Loaded<Chat, 'user'>) { ... }
 */

// Entity names that should be wrapped with Loaded<>
// This list should match the entities in libs/backend-shared/src/orm/entities
const ENTITY_NAMES = [
  // Accounts
  'User',
  'Tenant',
  // Meetings
  'Meeting',
  'MeetingMediaAsset',
  'MeetingTranscript',
  'MeetingTranscriptSegment',
  'MeetingSpeaker',
  'MeetingAttendee',
  'MeetingRecording',
  'MeetingReport',
  // Chats
  'Chat',
  'ChatMessage',
  'ChatAsset',
  // Billing
  'Plan',
  'Subscription',
  // Coins
  'Coin',
  'CoinTransaction',
  'CoinLog',
  'TenantCoin',
  'TenantCoinTransaction',
  'TenantCoinLog',
  // Drive
  'DriveFile',
  'DriveFolder',
  'DrivePermission',
  // MS Graph
  'MsGraphSubscription',
  // Users
  'VoiceprintAsset',
];

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Ensure MikroORM entity types in function parameters use Loaded<> wrapper',
      category: 'MikroORM',
      recommended: true,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          additionalEntities: {
            type: 'array',
            items: { type: 'string' },
            description: 'Additional entity names to check',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      requireLoadedType:
        'Parameter "{{paramName}}" uses entity type "{{entityType}}" directly. Use Loaded<{{entityType}}, ...> to ensure type-safe access to populated relations.',
    },
  },

  create(context) {
    const options = context.options[0] || {};
    const additionalEntities = options.additionalEntities || [];
    const allEntities = new Set([...ENTITY_NAMES, ...additionalEntities]);

    /**
     * Check if a type annotation is a direct entity type (not wrapped)
     */
    function isDirectEntityType(typeAnnotation) {
      if (!typeAnnotation) return null;

      const type = typeAnnotation.typeAnnotation;
      if (!type) return null;

      // Direct entity type: Chat, User, etc.
      if (
        type.type === 'TSTypeReference' &&
        type.typeName &&
        type.typeName.type === 'Identifier'
      ) {
        const typeName = type.typeName.name;
        if (allEntities.has(typeName)) {
          return typeName;
        }
      }

      return null;
    }

    /**
     * Check if type is already wrapped with Loaded<>
     */
    function isLoadedType(typeAnnotation) {
      if (!typeAnnotation) return false;

      const type = typeAnnotation.typeAnnotation;
      if (!type) return false;

      if (
        type.type === 'TSTypeReference' &&
        type.typeName &&
        type.typeName.type === 'Identifier' &&
        type.typeName.name === 'Loaded'
      ) {
        return true;
      }

      return false;
    }

    /**
     * Get parameter name
     */
    function getParamName(param) {
      if (param.type === 'Identifier') {
        return param.name;
      }
      if (
        param.type === 'AssignmentPattern' &&
        param.left.type === 'Identifier'
      ) {
        return param.left.name;
      }
      return '<unknown>';
    }

    /**
     * Check function parameters
     */
    function checkParams(params) {
      for (const param of params) {
        let typeAnnotation = null;
        let paramNode = param;

        // Handle different parameter types
        if (param.type === 'Identifier') {
          typeAnnotation = param.typeAnnotation;
        } else if (param.type === 'AssignmentPattern') {
          typeAnnotation = param.left.typeAnnotation;
          paramNode = param.left;
        } else if (param.type === 'TSParameterProperty') {
          typeAnnotation = param.parameter.typeAnnotation;
          paramNode = param.parameter;
        }

        // Skip if already using Loaded<>
        if (isLoadedType(typeAnnotation)) {
          continue;
        }

        // Check for direct entity type
        const entityType = isDirectEntityType(typeAnnotation);
        if (entityType) {
          context.report({
            node: paramNode,
            messageId: 'requireLoadedType',
            data: {
              paramName: getParamName(param),
              entityType,
            },
          });
        }
      }
    }

    // Track nodes we've already checked to avoid duplicate reports
    const checkedNodes = new WeakSet();

    return {
      // Regular function declarations
      FunctionDeclaration(node) {
        if (checkedNodes.has(node)) return;
        checkedNodes.add(node);
        checkParams(node.params);
      },

      // Arrow functions and function expressions
      // Skip FunctionExpression inside MethodDefinition (handled by MethodDefinition)
      FunctionExpression(node) {
        if (checkedNodes.has(node)) return;
        // Skip if parent is MethodDefinition (will be handled there)
        if (node.parent && node.parent.type === 'MethodDefinition') {
          return;
        }
        checkedNodes.add(node);
        checkParams(node.params);
      },

      ArrowFunctionExpression(node) {
        if (checkedNodes.has(node)) return;
        checkedNodes.add(node);
        checkParams(node.params);
      },

      // Class methods
      MethodDefinition(node) {
        if (node.value && node.value.params) {
          if (checkedNodes.has(node.value)) return;
          checkedNodes.add(node.value);
          checkParams(node.value.params);
        }
      },
    };
  },
};
