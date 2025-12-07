import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { IS_PUBLIC_KEY } from '../auth.constant';
import { JwtAuthGuard } from './jwt-auth.guard';

// Mock passport AuthGuard to avoid needing actual JWT strategy
jest.mock('@nestjs/passport', () => ({
  AuthGuard: () => {
    return class MockAuthGuard {
      canActivate() {
        return true;
      }
    };
  },
}));

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: jest.Mocked<Reflector>;

  const createMockContext = () => {
    return {
      getHandler: jest.fn().mockReturnValue(function noop() { /* handler */ }),
      getClass: jest.fn().mockReturnValue(class {}),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ headers: {} }),
        getResponse: jest.fn().mockReturnValue({}),
      }),
      getType: jest.fn().mockReturnValue('http'),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new JwtAuthGuard(reflector);
  });

  describe('canActivate', () => {
    it('should return true for public routes', () => {
      const context = createMockContext();
      reflector.getAllAndOverride.mockReturnValue(true);

      const result = guard.canActivate(context);

      expect(result).toBe(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should check IS_PUBLIC_KEY metadata', () => {
      const context = createMockContext();
      reflector.getAllAndOverride.mockReturnValue(false);

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });

    it('should call parent canActivate when not public', () => {
      const context = createMockContext();
      reflector.getAllAndOverride.mockReturnValue(false);

      // Parent's canActivate (mocked) returns true
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should call parent canActivate when isPublic is undefined', () => {
      const context = createMockContext();
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
