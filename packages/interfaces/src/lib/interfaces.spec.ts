import { LogLevel } from './interfaces';

describe('LogLevel enum', () => {
  it('should have correct values', () => {
    expect(LogLevel.Error).toBe('error');
    expect(LogLevel.Warn).toBe('warn');
    expect(LogLevel.Log).toBe('log');
    expect(LogLevel.Verbose).toBe('verbose');
    expect(LogLevel.Debug).toBe('debug');
  });

  it('should have exactly 5 levels', () => {
    const values = Object.values(LogLevel);
    expect(values).toHaveLength(5);
  });

  it('should be usable as type guards', () => {
    const isValidLogLevel = (level: string): level is LogLevel => {
      return Object.values(LogLevel).includes(level as LogLevel);
    };

    expect(isValidLogLevel('error')).toBe(true);
    expect(isValidLogLevel('debug')).toBe(true);
    expect(isValidLogLevel('invalid')).toBe(false);
  });
});
