/**
 * Custom ESLint rules for pino logger
 *
 * These rules help maintain consistent logging format across the codebase.
 */

import pinoLoggerFormat from './pino-logger-format.mjs';

export default {
  rules: {
    'pino-logger-format': pinoLoggerFormat,
  },
};
