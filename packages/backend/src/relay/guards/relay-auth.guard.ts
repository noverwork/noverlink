import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AppConfigService } from '../../app-config';

@Injectable()
export class RelayAuthGuard implements CanActivate {
  constructor(private readonly configService: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const relaySecret = request.headers['x-relay-secret'];

    if (!relaySecret) {
      throw new UnauthorizedException('Missing X-Relay-Secret header');
    }

    if (relaySecret !== this.configService.relay.secret) {
      throw new UnauthorizedException('Invalid relay secret');
    }

    return true;
  }
}
