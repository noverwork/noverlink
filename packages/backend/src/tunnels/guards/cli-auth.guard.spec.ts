import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Plan, User } from '@noverlink/backend-shared';

import { AuthService } from '../../auth/auth.service';
import { CliAuthGuard } from './cli-auth.guard';

describe('CliAuthGuard', () => {
  let guard: CliAuthGuard;
  let authService: jest.Mocked<AuthService>;

  const mockPlan = {
    id: 'sandbox',
    name: 'Sandbox',
    baseDomain: 'noverlink-free.app',
    maxTunnels: 1,
    maxBandwidthMb: 1000,
  } as unknown as Plan;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    plan: { $: mockPlan, id: 'sandbox' },
    isActive: true,
  } as unknown as User;

  const mockExecutionContext = (authHeader?: string) => {
    const request: Record<string, unknown> = {
      headers: {
        authorization: authHeader,
      },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(async () => {
    const mockAuthService = {
      validateCliToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CliAuthGuard,
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    guard = module.get<CliAuthGuard>(CliAuthGuard);
    authService = module.get(AuthService);
  });

  describe('canActivate', () => {
    it('should allow access with valid CLI token', async () => {
      authService.validateCliToken.mockResolvedValue(mockUser);
      const context = mockExecutionContext('Bearer nv_valid-token');

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(authService.validateCliToken).toHaveBeenCalledWith(
        'nv_valid-token'
      );
    });

    it('should attach user to request on success', async () => {
      authService.validateCliToken.mockResolvedValue(mockUser);
      const context = mockExecutionContext('Bearer nv_valid-token');
      const request = context.switchToHttp().getRequest();

      await guard.canActivate(context);

      expect((request as { user: User }).user).toBe(mockUser);
    });

    it('should throw UnauthorizedException when no auth header', async () => {
      const context = mockExecutionContext(undefined);

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Missing authorization header')
      );
    });

    it('should throw UnauthorizedException for non-Bearer format', async () => {
      const context = mockExecutionContext('Basic nv_token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Invalid authorization format')
      );
    });

    it('should throw UnauthorizedException when token missing after Bearer', async () => {
      const context = mockExecutionContext('Bearer ');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Invalid authorization format')
      );
    });

    it('should throw UnauthorizedException for invalid CLI token', async () => {
      authService.validateCliToken.mockResolvedValue(null);
      const context = mockExecutionContext('Bearer nv_invalid-token');

      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Invalid CLI token')
      );
    });

    it('should handle Bearer without space correctly', async () => {
      const context = mockExecutionContext('BearerToken');

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException
      );
    });
  });
});
