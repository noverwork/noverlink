import * as crypto from 'node:crypto';

import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuthConnection, OAuthProvider, User } from '@noverlink/backend-shared';
import * as argon2 from 'argon2';

import { AppConfigService } from '../app-config';
import { ARGON2_OPTIONS } from './auth.constant';
import type {
  DeviceCodeResponse,
  DevicePollResponse,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
} from './dto';
import type { OAuthProfile } from './strategies/google.strategy';

// Device code storage (in-memory for MVP, use Redis in production)
interface PendingDeviceCode {
  userCode: string;
  expiresAt: number;
  userId?: string; // Set when user approves
  denied?: boolean;
}

const pendingDeviceCodes = new Map<string, PendingDeviceCode>();

// Cleanup expired device codes periodically
setInterval(() => {
  const now = Date.now();
  for (const [code, data] of pendingDeviceCodes.entries()) {
    if (data.expiresAt < now) {
      pendingDeviceCodes.delete(code);
    }
  }
}, 60_000); // Every minute

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
    plan: string;
  };
}

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.em.findOne(User, { email: dto.email });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await argon2.hash(dto.password, ARGON2_OPTIONS);

    const user = this.em.create(User, {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    });

    await this.em.persistAndFlush(user);

    return this.generateTokens(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.em.findOne(User, { email: dto.email });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    return this.generateTokens(user);
  }

  async refreshToken(dto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(dto.refreshToken, {
        secret: this.appConfigService.jwt.refreshSecret,
      });

      const user = await this.em.findOne(User, { id: payload.sub });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateOAuthLogin(
    provider: OAuthProvider,
    profile: OAuthProfile
  ): Promise<AuthResponse> {
    // Validate email is present
    if (!profile.email) {
      throw new BadRequestException(
        'Email is required. Please ensure your GitHub email is public or use a different login method.'
      );
    }

    // Check if OAuth connection already exists
    let connection = await this.em.findOne(
      OAuthConnection,
      {
        provider,
        providerUserId: profile.id,
      },
      { populate: ['user'] }
    );

    if (connection) {
      return this.generateTokens(connection.user);
    }

    // Check if user exists with this email
    let user = await this.em.findOne(User, { email: profile.email });

    if (!user) {
      // Create new user
      user = this.em.create(User, {
        name: profile.name,
        email: profile.email,
        emailVerified: true,
      });
    } else {
      // Mark email as verified since OAuth provider confirmed it
      user.emailVerified = true;
    }

    // Create OAuth connection
    connection = this.em.create(OAuthConnection, {
      provider,
      providerUserId: profile.id,
      user,
    });

    await this.em.persistAndFlush([user, connection]);

    return this.generateTokens(user);
  }

  private generateTokens(user: User): AuthResponse {
    const payload = { sub: user.id, email: user.email };
    const { jwt } = this.appConfigService;

    const accessExpiresIn = this.parseExpiryToSeconds(jwt.expiresIn);
    const refreshExpiresIn = this.parseExpiryToSeconds(jwt.refreshExpiresIn);

    const accessToken = this.jwtService.sign(payload, {
      secret: jwt.secret,
      expiresIn: accessExpiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwt.refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessExpiresIn,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        plan: user.plan,
      },
    };
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 900; // Default 15 minutes
    }

    const [, num, unit] = match;
    const multipliers: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return parseInt(num, 10) * multipliers[unit];
  }

  // ==================== Device Code Flow ====================

  /**
   * Start device code flow for CLI authentication
   */
  startDeviceFlow(): DeviceCodeResponse {
    const deviceCode = crypto.randomBytes(32).toString('hex');
    const userCode = this.generateUserCode();
    const expiresIn = 900; // 15 minutes

    pendingDeviceCodes.set(deviceCode, {
      userCode,
      expiresAt: Date.now() + expiresIn * 1000,
    });

    const frontendUrl = this.appConfigService.app.frontendUrl;

    return {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: `${frontendUrl}/auth/device`,
      expires_in: expiresIn,
      interval: 5, // Poll every 5 seconds
    };
  }

  /**
   * Poll for device code approval
   */
  async pollDeviceFlow(deviceCode: string): Promise<DevicePollResponse> {
    const pending = pendingDeviceCodes.get(deviceCode);

    if (!pending) {
      return { error: 'expired_token' };
    }

    if (pending.expiresAt < Date.now()) {
      pendingDeviceCodes.delete(deviceCode);
      return { error: 'expired_token' };
    }

    if (pending.denied) {
      pendingDeviceCodes.delete(deviceCode);
      return { error: 'access_denied' };
    }

    if (!pending.userId) {
      return { error: 'authorization_pending' };
    }

    // User has approved - generate CLI token
    const user = await this.em.findOne(User, { id: pending.userId });
    if (!user) {
      pendingDeviceCodes.delete(deviceCode);
      return { error: 'access_denied' };
    }

    // Generate long-lived CLI auth token
    const authToken = await this.generateCliToken(user);

    // Cleanup
    pendingDeviceCodes.delete(deviceCode);

    return { auth_token: authToken };
  }

  /**
   * Verify user code and approve device (called from web UI)
   */
  async approveDeviceCode(userCode: string, userId: string): Promise<boolean> {
    for (const [deviceCode, data] of pendingDeviceCodes.entries()) {
      if (data.userCode === userCode.toUpperCase() && data.expiresAt > Date.now()) {
        data.userId = userId;
        return true;
      }
    }
    return false;
  }

  /**
   * Deny device code (called from web UI)
   */
  denyDeviceCode(userCode: string): boolean {
    for (const [, data] of pendingDeviceCodes.entries()) {
      if (data.userCode === userCode.toUpperCase() && data.expiresAt > Date.now()) {
        data.denied = true;
        return true;
      }
    }
    return false;
  }

  /**
   * Validate CLI auth token and return user
   */
  async validateCliToken(token: string): Promise<User | null> {
    // Token format: nv_<base64>
    if (!token.startsWith('nv_')) {
      return null;
    }

    const user = await this.em.findOne(User, { authToken: token });
    if (!user || !user.isActive) {
      return null;
    }

    return user;
  }

  /**
   * Generate long-lived CLI authentication token
   */
  private async generateCliToken(user: User): Promise<string> {
    const token = `nv_${crypto.randomBytes(32).toString('base64url')}`;

    // Save token to user (for now, plaintext; production should hash it)
    user.authToken = token;
    await this.em.persistAndFlush(user);

    return token;
  }

  /**
   * Generate human-readable user code (XXXX-XXXX)
   */
  private generateUserCode(): string {
    // Unambiguous alphabet (no 0/O, 1/I/L)
    const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    const bytes = crypto.randomBytes(8);
    const chars = Array.from(bytes).map((b) => alphabet[b % alphabet.length]);
    return `${chars.slice(0, 4).join('')}-${chars.slice(4).join('')}`;
  }
}
