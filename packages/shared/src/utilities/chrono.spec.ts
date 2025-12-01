import { day, hour, minute, month, second, week, year } from './chrono';

describe('Chrono Utilities', () => {
  describe('second', () => {
    it('should convert 1 second to 1000 milliseconds', () => {
      expect(second(1)).toBe(1000);
    });

    it('should convert 5 seconds to 5000 milliseconds', () => {
      expect(second(5)).toBe(5000);
    });

    it('should handle 0 seconds', () => {
      expect(second(0)).toBe(0);
    });

    it('should handle fractional seconds', () => {
      expect(second(0.5)).toBe(500);
    });
  });

  describe('minute', () => {
    it('should convert 1 minute to 60000 milliseconds', () => {
      expect(minute(1)).toBe(60000);
    });

    it('should convert 5 minutes to 300000 milliseconds', () => {
      expect(minute(5)).toBe(300000);
    });

    it('should handle 0 minutes', () => {
      expect(minute(0)).toBe(0);
    });
  });

  describe('hour', () => {
    it('should convert 1 hour to 3600000 milliseconds', () => {
      expect(hour(1)).toBe(3600000);
    });

    it('should convert 24 hours to equal 1 day', () => {
      expect(hour(24)).toBe(day(1));
    });
  });

  describe('day', () => {
    it('should convert 1 day to 86400000 milliseconds', () => {
      expect(day(1)).toBe(86400000);
    });

    it('should convert 7 days to equal 1 week', () => {
      expect(day(7)).toBe(week(1));
    });
  });

  describe('week', () => {
    it('should convert 1 week to 604800000 milliseconds', () => {
      expect(week(1)).toBe(604800000);
    });

    it('should equal 7 days', () => {
      expect(week(1)).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('month', () => {
    it('should convert 1 month to approximately 4 weeks', () => {
      expect(month(1)).toBe(4 * week(1));
    });
  });

  describe('year', () => {
    it('should convert 1 year to 12 months', () => {
      expect(year(1)).toBe(12 * month(1));
    });
  });

  describe('composition', () => {
    it('should allow combining time units', () => {
      const thirtyMinutesThirtySeconds = minute(30) + second(30);
      expect(thirtyMinutesThirtySeconds).toBe(30 * 60 * 1000 + 30 * 1000);
    });
  });
});
