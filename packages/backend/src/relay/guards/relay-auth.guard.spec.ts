import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppConfigService } from '../../app-config';
import { RelayAuthGuard } from './relay-auth.guard';

describe('RelayAuthGuard', () => {
  let guard: RelayAuthGuard;

  const mockExecutionContext = (relaySecret?: string) => {
    const request = {
      headers: {
        'x-relay-secret': relaySecret,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockConfigService = {
      relay: {
        secret: 'correct-relay-secret-12345',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RelayAuthGuard,
        { provide: AppConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<RelayAuthGuard>(RelayAuthGuard);
  });

  describe('canActivate', () => {
    it('should allow access with valid relay secret', () => {
      const context = mockExecutionContext('correct-relay-secret-12345');

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException when X-Relay-Secret header is missing', () => {
      const context = mockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Missing X-Relay-Secret header')
      );
    });

    it('should throw UnauthorizedException when relay secret is invalid', () => {
      const context = mockExecutionContext('wrong-secret');

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid relay secret')
      );
    });

    it('should throw UnauthorizedException when relay secret is empty string', () => {
      const context = mockExecutionContext('');

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Missing X-Relay-Secret header')
      );
    });

    it('should be case-sensitive for relay secret', () => {
      const context = mockExecutionContext('CORRECT-RELAY-SECRET-12345');

      expect(() => guard.canActivate(context)).toThrow(
        new UnauthorizedException('Invalid relay secret')
      );
    });
  });
});
