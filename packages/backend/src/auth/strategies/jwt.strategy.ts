import type { Loaded } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { User } from '@noverlink/backend-shared';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AppConfigService } from '../../app-config';

interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly em: EntityManager,
    appConfigService: AppConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfigService.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<Loaded<User, 'plan'>> {
    const user = await this.em.findOne(
      User,
      { id: payload.sub },
      { populate: ['plan'] }
    );

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    return user;
  }
}
