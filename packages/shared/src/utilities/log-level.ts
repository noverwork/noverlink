import { LogLevel } from '@noverlink/interfaces';

// Hierarchical log level mapping (immutable)
const LOG_LEVEL_MAP: Record<LogLevel, LogLevel[]> = {
  [LogLevel.Error]: [LogLevel.Error],
  [LogLevel.Warn]: [LogLevel.Error, LogLevel.Warn],
  [LogLevel.Log]: [LogLevel.Error, LogLevel.Warn, LogLevel.Log],
  [LogLevel.Verbose]: [
    LogLevel.Error,
    LogLevel.Warn,
    LogLevel.Log,
    LogLevel.Verbose,
  ],
  [LogLevel.Debug]: [
    LogLevel.Error,
    LogLevel.Warn,
    LogLevel.Log,
    LogLevel.Verbose,
    LogLevel.Debug,
  ],
} as const;

/**
 * Parse log level into hierarchical array
 * Hierarchical levels: error < warn < log < verbose < debug
 *
 * @param configuredLevel - The validated log level from env (required, validated by schema)
 * @returns Array of enabled log levels
 *
 * @example
 * parseLogLevels('debug') // [LogLevel.Error, LogLevel.Warn, LogLevel.Log, LogLevel.Verbose, LogLevel.Debug]
 * parseLogLevels('log')   // [LogLevel.Error, LogLevel.Warn, LogLevel.Log]
 */
export function parseLogLevels(configuredLevel: string): LogLevel[] {
  return LOG_LEVEL_MAP[configuredLevel as LogLevel];
}
