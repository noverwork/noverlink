import { LogLevel } from '@noverlink/interfaces';

import { parseLogLevels } from './log-level';

describe('parseLogLevels', () => {
  it('should return only error level for error', () => {
    const levels = parseLogLevels('error');
    expect(levels).toEqual([LogLevel.Error]);
  });

  it('should return error and warn levels for warn', () => {
    const levels = parseLogLevels('warn');
    expect(levels).toEqual([LogLevel.Error, LogLevel.Warn]);
  });

  it('should return error, warn, and log levels for log', () => {
    const levels = parseLogLevels('log');
    expect(levels).toEqual([LogLevel.Error, LogLevel.Warn, LogLevel.Log]);
  });

  it('should return error, warn, log, and verbose levels for verbose', () => {
    const levels = parseLogLevels('verbose');
    expect(levels).toEqual([
      LogLevel.Error,
      LogLevel.Warn,
      LogLevel.Log,
      LogLevel.Verbose,
    ]);
  });

  it('should return all levels for debug', () => {
    const levels = parseLogLevels('debug');
    expect(levels).toEqual([
      LogLevel.Error,
      LogLevel.Warn,
      LogLevel.Log,
      LogLevel.Verbose,
      LogLevel.Debug,
    ]);
  });

  it('should maintain hierarchical order', () => {
    const debugLevels = parseLogLevels('debug');
    const verboseLevels = parseLogLevels('verbose');
    const logLevels = parseLogLevels('log');

    // Debug should contain all levels from verbose
    expect(debugLevels).toEqual(expect.arrayContaining(verboseLevels));

    // Verbose should contain all levels from log
    expect(verboseLevels).toEqual(expect.arrayContaining(logLevels));
  });

  it('should include error in all log levels', () => {
    const allLevelStrings = ['error', 'warn', 'log', 'verbose', 'debug'];

    for (const levelStr of allLevelStrings) {
      const levels = parseLogLevels(levelStr);
      expect(levels).toContain(LogLevel.Error);
    }
  });
});
