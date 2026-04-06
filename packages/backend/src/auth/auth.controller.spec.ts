import { Test, TestingModule } from '@nestjs/testing';

import { AppConfigService } from '../app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthResponse = {
    accessToken: 'access-token-123',
    refreshToken: 'refresh-token-456',
    expiresIn: 900,
    user: {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const mockAppConfigService = {};

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
  });
});
