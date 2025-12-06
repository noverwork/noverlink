import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks';
import type { Request } from 'express';

import { AppConfigService } from '../../app-config';

@Injectable()
export class PolarWebhookGuard implements CanActivate {
  private readonly logger = new Logger(PolarWebhookGuard.name);

  constructor(private readonly configService: AppConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Get raw body - NestJS should have this if rawBody is enabled
    const rawBody = (request as Request & { rawBody?: Buffer }).rawBody;
    if (!rawBody) {
      this.logger.error('Raw body not available - ensure rawBody option is enabled');
      throw new UnauthorizedException('Webhook verification failed');
    }

    try {
      const payload = validateEvent(
        rawBody.toString(),
        Object.fromEntries(
          Object.entries(request.headers).map(([k, v]) => [k, String(v)])
        ),
        this.configService.polar.webhookSecret
      );

      // Attach validated payload to request for controller to use
      (request as Request & { polarPayload: unknown }).polarPayload = payload;

      return true;
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        this.logger.warn(`Webhook verification failed: ${error.message}`);
        throw new UnauthorizedException('Invalid webhook signature');
      }
      this.logger.error('Unexpected error during webhook verification', error);
      throw new UnauthorizedException('Webhook verification failed');
    }
  }
}
