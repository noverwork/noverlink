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
import type { LoginDto, RefreshTokenDto, RegisterDto } from './dto';
import type { OAuthProfile } from './strategies/google.strategy';

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
      // Update tokens if provided
      if (profile.accessToken) {
        connection.accessToken = profile.accessToken;
      }
      if (profile.refreshToken) {
        connection.refreshToken = profile.refreshToken;
      }
      await this.em.flush();

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
      accessToken: profile.accessToken,
      refreshToken: profile.refreshToken,
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
}
