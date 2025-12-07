import { Test, TestingModule } from '@nestjs/testing';
import { OAuthProvider, Plan, User } from '@noverlink/backend-shared';
import type { Response } from 'express';

import { AppConfigService } from '../app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockPlan = {
    id: 'sandbox',
    name: 'Sandbox',
    baseDomain: 'noverlink-free.app',
    maxTunnels: 1,
    maxBandwidthMb: 1000,
  } as unknown as Plan;

  const mockAuthResponse = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    expiresIn: 900,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      plan: 'sandbox',
    },
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    emailVerified: true,
    plan: { $: mockPlan, id: 'sandbox' },
    isActive: true,
    createdAt: new Date('2025-01-01'),
  } as unknown as User;

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
      refreshToken: jest.fn(),
      validateOAuthLogin: jest.fn(),
      startDeviceFlow: jest.fn(),
      pollDeviceFlow: jest.fn(),
      approveDeviceCode: jest.fn(),
      denyDeviceCode: jest.fn(),
    };

    const mockAppConfigService = {
      app: {
        frontendUrl: 'http://localhost:4200',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      authService.register.mockResolvedValue(mockAuthResponse);

      const dto = {
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      };

      const result = await controller.register(dto);

      expect(result).toBe(mockAuthResponse);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });

    it('should propagate registration errors', async () => {
      authService.register.mockRejectedValue(new Error('Email already exists'));

      await expect(
        controller.register({
          email: 'existing@example.com',
          password: 'password123',
          name: 'User',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('login', () => {
    it('should login user with credentials', async () => {
      authService.login.mockResolvedValue(mockAuthResponse);

      const dto = {
        email: 'test@example.com',
        password: 'correct-password',
      };

      const result = await controller.login(dto);

      expect(result).toBe(mockAuthResponse);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('should propagate login errors', async () => {
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        controller.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refresh', () => {
    it('should refresh tokens', async () => {
      authService.refreshToken.mockResolvedValue(mockAuthResponse);

      const dto = { refreshToken: 'valid-refresh-token' };

      const result = await controller.refresh(dto);

      expect(result).toBe(mockAuthResponse);
      expect(authService.refreshToken).toHaveBeenCalledWith(dto);
    });

    it('should propagate refresh errors', async () => {
      authService.refreshToken.mockRejectedValue(new Error('Invalid token'));

      await expect(
        controller.refresh({ refreshToken: 'invalid-token' })
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('OAuth callbacks', () => {
    const mockResponse = {
      redirect: jest.fn(),
    } as unknown as Response;

    describe('googleCallback', () => {
      it('should redirect with tokens after Google OAuth', async () => {
        authService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);

        const mockRequest = {
          user: {
            id: 'google-123',
            email: 'test@gmail.com',
            name: 'Google User',
          },
        };

        await controller.googleCallback(mockRequest as never, mockResponse);

        expect(authService.validateOAuthLogin).toHaveBeenCalledWith(
          OAuthProvider.GOOGLE,
          mockRequest.user
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          expect.stringContaining('http://localhost:4200/auth/callback?')
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          expect.stringContaining('accessToken=access-token-123')
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          expect.stringContaining('refreshToken=refresh-token-456')
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          expect.stringContaining('expiresIn=900')
        );
      });
    });

    describe('githubCallback', () => {
      it('should redirect with tokens after GitHub OAuth', async () => {
        authService.validateOAuthLogin.mockResolvedValue(mockAuthResponse);

        const mockRequest = {
          user: {
            id: 'github-456',
            email: 'test@github.com',
            name: 'GitHub User',
          },
        };

        await controller.githubCallback(mockRequest as never, mockResponse);

        expect(authService.validateOAuthLogin).toHaveBeenCalledWith(
          OAuthProvider.GITHUB,
          mockRequest.user
        );
        expect(mockResponse.redirect).toHaveBeenCalledWith(
          expect.stringContaining('http://localhost:4200/auth/callback?')
        );
      });
    });
  });

  describe('Device Code Flow', () => {
    describe('startDeviceFlow', () => {
      it('should return device code response', () => {
        const mockDeviceResponse = {
          device_code: 'device-123',
          user_code: 'ABCD-1234',
          verification_uri: 'http://localhost:4200/auth/device',
          expires_in: 300,
          interval: 5,
        };
        authService.startDeviceFlow.mockReturnValue(mockDeviceResponse);

        const result = controller.startDeviceFlow();

        expect(result).toBe(mockDeviceResponse);
        expect(authService.startDeviceFlow).toHaveBeenCalled();
      });
    });

    describe('pollDeviceFlow', () => {
      it('should poll for authorization status', async () => {
        authService.pollDeviceFlow.mockResolvedValue({
          error: 'authorization_pending',
        });

        const result = await controller.pollDeviceFlow({
          device_code: 'device-123',
        });

        expect(result).toEqual({ error: 'authorization_pending' });
        expect(authService.pollDeviceFlow).toHaveBeenCalledWith('device-123');
      });

      it('should return auth token when approved', async () => {
        authService.pollDeviceFlow.mockResolvedValue({
          auth_token: 'nv_token-123',
        });

        const result = await controller.pollDeviceFlow({
          device_code: 'device-123',
        });

        expect(result).toEqual({ auth_token: 'nv_token-123' });
      });
    });

    describe('approveDeviceCode', () => {
      it('should approve device code for authenticated user', async () => {
        authService.approveDeviceCode.mockResolvedValue(true);

        const result = await controller.approveDeviceCode(
          'ABCD-1234',
          mockUser as never
        );

        expect(result).toEqual({ success: true });
        expect(authService.approveDeviceCode).toHaveBeenCalledWith(
          'ABCD-1234',
          'user-123'
        );
      });

      it('should return false for invalid code', async () => {
        authService.approveDeviceCode.mockResolvedValue(false);

        const result = await controller.approveDeviceCode(
          'INVALID',
          mockUser as never
        );

        expect(result).toEqual({ success: false });
      });
    });

    describe('denyDeviceCode', () => {
      it('should deny device code', () => {
        authService.denyDeviceCode.mockReturnValue(true);

        const result = controller.denyDeviceCode('ABCD-1234');

        expect(result).toEqual({ success: true });
        expect(authService.denyDeviceCode).toHaveBeenCalledWith('ABCD-1234');
      });

      it('should return false for unknown code', () => {
        authService.denyDeviceCode.mockReturnValue(false);

        const result = controller.denyDeviceCode('UNKNOWN');

        expect(result).toEqual({ success: false });
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      const result = controller.getProfile(mockUser as never);

      expect(result).toEqual({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        plan: 'sandbox',
        maxTunnels: 1,
        maxBandwidthMb: 1000,
        isActive: true,
        createdAt: mockUser.createdAt,
      });
    });

    it('should only include specified fields', () => {
      const result = controller.getProfile(mockUser as never);

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('cliToken');
    });
  });
});
