import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { AuthService } from '../../auth/auth.service';

@Injectable()
export class CliAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Missing authorization header');
    }

    // Extract token from "Bearer nv_xxx" format
    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format');
    }

    // Validate CLI token
    const user = await this.authService.validateCliToken(token);

    if (!user) {
      throw new UnauthorizedException('Invalid CLI token');
    }

    // Attach user to request for use in controller
    (request as Request & { user: typeof user }).user = user;

    return true;
  }
}
