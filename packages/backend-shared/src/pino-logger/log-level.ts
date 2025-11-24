import { LogLevel } from '@nestjs/common';

// Hierarchical log levels: fatal < error < warn < log < verbose < debug
const LOG_LEVELS: LogLevel[] = [
  'fatal',
  'error',
  'warn',
  'log',
  'verbose',
  'debug',
];

/**
 * Valid NestJS log levels for validation (e.g., in @IsEnum decorator)
 */
export const VALID_LOG_LEVELS = LOG_LEVELS as readonly string[];

/**
 * Parse log level into hierarchical array
 *
 * @param configuredLevel - The validated log level from env
 * @returns Array of enabled log levels
 *
 * @example
 * parseLogLevels('debug') // ['fatal', 'error', 'warn', 'log', 'verbose', 'debug']
 * parseLogLevels('log')   // ['fatal', 'error', 'warn', 'log']
 */
export function parseLogLevels(configuredLevel: string): LogLevel[] {
  const index = LOG_LEVELS.indexOf(configuredLevel as LogLevel);
  return index >= 0 ? LOG_LEVELS.slice(0, index + 1) : LOG_LEVELS.slice(0, 4); // Default to 'log'
}
