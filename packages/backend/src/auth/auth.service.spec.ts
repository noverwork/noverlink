import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import {
  OAuthConnection,
  OAuthProvider,
  Plan,
  User,
} from '@noverlink/backend-shared';
import * as argon2 from 'argon2';

import { AppConfigService } from '../app-config';
import { AuthService } from './auth.service';

jest.mock('argon2');

describe('AuthService', () => {
  let service: AuthService;
  let em: jest.Mocked<EntityManager>;
  let jwtService: jest.Mocked<JwtService>;

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
    password: 'hashed-password',
    plan: { $: mockPlan, id: 'sandbox' },
    isActive: true,
  } as unknown as User;

  beforeEach(async () => {
    const mockEm = {
      findOne: jest.fn(),
      create: jest.fn(),
      persistAndFlush: jest.fn(),
      getReference: jest.fn().mockImplementation((_, id) => ({ id })),
      populate: jest.fn().mockResolvedValue(undefined),
    };

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const mockAppConfigService = {
      jwt: {
        secret: 'jwt-secret',
        expiresIn: '15m',
        refreshSecret: 'refresh-secret',
        refreshExpiresIn: '7d',
      },
      app: {
        frontendUrl: 'https://app.noverlink.io',
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: EntityManager, useValue: mockEm },
        { provide: JwtService, useValue: mockJwtService },
        { provide: AppConfigService, useValue: mockAppConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    em = module.get(EntityManager);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockReturnValue(mockUser);
      em.persistAndFlush.mockResolvedValue(undefined);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('expiresIn');
      expect(result.user).toHaveProperty('email', 'test@example.com');
      expect(argon2.hash).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      em.findOne.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      em.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct-password',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.id).toBe('user-123');
    });

    it('should throw UnauthorizedException for invalid email', async () => {
      em.findOne.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'wrong@example.com',
          password: 'password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      em.findOne.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive account', async () => {
      em.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as unknown as User);
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'correct-password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for OAuth-only user (no password)', async () => {
      em.findOne.mockResolvedValue({
        ...mockUser,
        password: null,
      } as unknown as User);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'password',
        })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        email: 'test@example.com',
      });
      em.findOne.mockResolvedValue(mockUser);

      const result = await service.refreshToken({
        refreshToken: 'valid-refresh-token',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(
        service.refreshToken({ refreshToken: 'invalid-token' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      jwtService.verify.mockReturnValue({
        sub: 'user-123',
        email: 'test@example.com',
      });
      em.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as unknown as User);

      await expect(
        service.refreshToken({ refreshToken: 'valid-token' })
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateOAuthLogin', () => {
    it('should login existing OAuth user', async () => {
      const connection = {
        user: { $: mockUser },
      };
      em.findOne.mockResolvedValueOnce(connection);

      const result = await service.validateOAuthLogin(OAuthProvider.GITHUB, {
        id: 'github-123',
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(result).toHaveProperty('accessToken');
    });

    it('should create new user for new OAuth login', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockImplementation((entity, data) => ({
        ...data,
        id: 'new-user',
      }));
      em.persistAndFlush.mockResolvedValue(undefined);

      await service.validateOAuthLogin(OAuthProvider.GOOGLE, {
        id: 'google-456',
        email: 'new@example.com',
        name: 'New User',
      });

      expect(em.create).toHaveBeenCalledWith(
        User,
        expect.objectContaining({
          email: 'new@example.com',
          emailVerified: true,
        })
      );
      expect(em.create).toHaveBeenCalledWith(
        OAuthConnection,
        expect.objectContaining({
          provider: OAuthProvider.GOOGLE,
          providerUserId: 'google-456',
        })
      );
    });

    it('should throw BadRequestException if email not provided', async () => {
      await expect(
        service.validateOAuthLogin(OAuthProvider.GITHUB, {
          id: 'github-123',
          email: '', // Empty email
          name: 'Test User',
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should link OAuth to existing email user', async () => {
      em.findOne.mockImplementation(async (entity, _query) => {
        if (entity === OAuthConnection) return null;
        if (entity === User) return mockUser;
        return null;
      });
      em.create.mockImplementation((entity, data) => data);
      em.persistAndFlush.mockResolvedValue(undefined);

      const result = await service.validateOAuthLogin(OAuthProvider.GITHUB, {
        id: 'github-789',
        email: 'test@example.com',
        name: 'Test User',
      });

      expect(result).toHaveProperty('accessToken');
    });
  });

  describe('Device Code Flow', () => {
    describe('startDeviceFlow', () => {
      it('should return device code response', () => {
        const result = service.startDeviceFlow();

        expect(result).toHaveProperty('device_code');
        expect(result).toHaveProperty('user_code');
        expect(result).toHaveProperty('verification_uri');
        expect(result).toHaveProperty('expires_in', 300);
        expect(result).toHaveProperty('interval', 5);
        expect(result.verification_uri).toBe(
          'https://app.noverlink.io/auth/device'
        );
      });

      it('should generate unique device codes', () => {
        const result1 = service.startDeviceFlow();
        const result2 = service.startDeviceFlow();

        expect(result1.device_code).not.toBe(result2.device_code);
        expect(result1.user_code).not.toBe(result2.user_code);
      });

      it('should generate user code in XXXX-XXXX format', () => {
        const result = service.startDeviceFlow();

        expect(result.user_code).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);
      });
    });

    describe('pollDeviceFlow', () => {
      it('should return authorization_pending for unapproved code', async () => {
        const { device_code } = service.startDeviceFlow();

        const result = await service.pollDeviceFlow(device_code);

        expect(result).toEqual({ error: 'authorization_pending' });
      });

      it('should return expired_token for unknown code', async () => {
        const result = await service.pollDeviceFlow('unknown-code');

        expect(result).toEqual({ error: 'expired_token' });
      });

      it('should return auth_token after approval', async () => {
        const { device_code, user_code } = service.startDeviceFlow();
        em.findOne.mockResolvedValue(mockUser);
        em.persistAndFlush.mockResolvedValue(undefined);

        await service.approveDeviceCode(user_code, 'user-123');
        const result = await service.pollDeviceFlow(device_code);

        expect(result).toHaveProperty('auth_token');
        expect((result as { auth_token: string }).auth_token).toMatch(/^nv_/);
      });

      it('should return access_denied for denied code', async () => {
        const { device_code, user_code } = service.startDeviceFlow();

        service.denyDeviceCode(user_code);
        const result = await service.pollDeviceFlow(device_code);

        expect(result).toEqual({ error: 'access_denied' });
      });
    });

    describe('approveDeviceCode', () => {
      it('should approve valid user code', async () => {
        const { user_code } = service.startDeviceFlow();

        const result = await service.approveDeviceCode(user_code, 'user-123');

        expect(result).toBe(true);
      });

      it('should return false for unknown user code', async () => {
        const result = await service.approveDeviceCode('XXXX-XXXX', 'user-123');

        expect(result).toBe(false);
      });

      it('should be case insensitive', async () => {
        const { user_code } = service.startDeviceFlow();

        const result = await service.approveDeviceCode(
          user_code.toLowerCase(),
          'user-123'
        );

        expect(result).toBe(true);
      });
    });
  });

  describe('validateCliToken', () => {
    it('should validate correct CLI token', async () => {
      em.findOne.mockResolvedValue(mockUser);

      const result = await service.validateCliToken('nv_test-token');

      expect(result).toBe(mockUser);
    });

    it('should return null for invalid token format', async () => {
      const result = await service.validateCliToken('invalid-token');

      expect(result).toBeNull();
    });

    it('should return null for unknown token', async () => {
      em.findOne.mockResolvedValue(null);

      const result = await service.validateCliToken('nv_unknown');

      expect(result).toBeNull();
    });

    it('should return null for inactive user', async () => {
      em.findOne.mockResolvedValue({
        ...mockUser,
        isActive: false,
      } as unknown as User);

      const result = await service.validateCliToken('nv_test-token');

      expect(result).toBeNull();
    });
  });

  describe('parseExpiryToSeconds', () => {
    it('should parse seconds correctly', async () => {
      em.findOne.mockResolvedValue(null);
      em.create.mockReturnValue({ ...mockUser, id: 'new' });
      em.persistAndFlush.mockResolvedValue(undefined);
      (argon2.hash as jest.Mock).mockResolvedValue('hashed');

      await service.register({
        email: 'new@example.com',
        password: 'pass',
        name: 'Test',
      });

      // Verify JWT sign was called with numeric expiresIn (parsed from config '15m' = 900 seconds)
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({ expiresIn: 900 })
      );
    });
  });
});
