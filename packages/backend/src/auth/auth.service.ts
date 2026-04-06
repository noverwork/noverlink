import { type Loaded } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@truley-interview/backend-shared';
import * as argon2 from 'argon2';

import { AppConfigService } from '../app-config';
import { ARGON2_OPTIONS } from './auth.constant';
import type { LoginDto, RegisterDto } from './dto';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly em: EntityManager,
    private readonly jwtService: JwtService,
    private readonly appConfigService: AppConfigService,
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

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: Loaded<User, never>): AuthResponse {
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
      },
    };
  }

  private parseExpiryToSeconds(expiry: string): number {
    const match = expiry.match(/^(\d+)([smhd])$/);

    if (!match) {
      return 900;
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
