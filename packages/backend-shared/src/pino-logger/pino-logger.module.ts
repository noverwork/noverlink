import type {
  DynamicModule,
  InjectionToken,
  OptionalFactoryDependency,
  Type,
} from '@nestjs/common';
import { Module } from '@nestjs/common';
import type { Environment } from '@noverlink/shared';
import type { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule } from 'nestjs-pino';

export interface PinoLoggerModuleOptions {
  isProduction: boolean;
  nodeEnv: Environment;
  serviceName: string;
}

export interface PinoLoggerModuleAsyncOptions {
  imports?: Array<Type | DynamicModule>;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
  useFactory: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ...args: any[]
  ) => Promise<PinoLoggerModuleOptions> | PinoLoggerModuleOptions;
}

/**
 * Shared Pino Logger Module for NestJS applications
 *
 * Features:
 * - Production: Structured JSON logging optimized for Loki
 * - Development: Colorized pretty-printed logs
 * - Auto-injection of service, tenantId, userId, requestId
 * - Flat log structure with method, url, statusCode, responseTime
 * - Automatic HTTP request logging (with health check exclusion)
 *
 * @example
 * ```ts
 * @Module({
 *   imports: [
 *     PinoLoggerModule.forRootAsync({
 *       imports: [AppConfigModule],
 *       inject: [AppConfigService],
 *       useFactory: (config: AppConfigService) => ({
 *         isProduction: config.env.isProduction,
 *         nodeEnv: config.env.nodeEnv,
 *         serviceName: 'backend',
 *       }),
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Module({})
export class PinoLoggerModule {
  static forRootAsync(options: PinoLoggerModuleAsyncOptions): DynamicModule {
    return {
      module: PinoLoggerModule,
      imports: [
        ...(options.imports || []),
        LoggerModule.forRootAsync({
          imports: options.imports,
          inject: options.inject || [],
          useFactory: async (...args) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const config = await options.useFactory(...(args as any[]));
            const { isProduction, serviceName } = config;

            return {
              pinoHttp: {
                level: isProduction ? 'info' : 'debug',

                // Production: JSON format for Loki
                // Development: Colorized pretty output
                transport: isProduction
                  ? undefined
                  : {
                      target: 'pino-pretty',
                      options: {
                        colorize: true,
                        translateTime: 'SYS:standard',
                        ignore: 'pid,hostname',
                        singleLine: false,
                      },
                    },

                // Custom serializers - disable default req/res serializers
                // We'll inject fields directly via customProps
                serializers: {
                  req: () => undefined,
                  res: () => undefined,
                },

                // Auto-inject fields to every log (flat structure)
                customProps: (req: IncomingMessage, res: ServerResponse) => {
                  const extendedReq = req as IncomingMessage &
                    Record<string, unknown>;

                  return {
                    service: serviceName,
                    tenantId: extendedReq['tenantId'] as string | undefined,
                    userId: (extendedReq['user'] as { id?: string } | undefined)
                      ?.id,
                    requestId: extendedReq['id'] as string,
                    method: req.method,
                    url: req.url,
                    statusCode: res.statusCode,
                  };
                },

                // Custom log formatters
                formatters: {
                  level: (label: string) => {
                    return { level: label };
                  },
                },

                // Auto-log HTTP requests (ignore health checks)
                autoLogging: {
                  ignore: (req: IncomingMessage) => {
                    return req.url === '/api/health';
                  },
                },

                // Request ID generation
                genReqId: (req: IncomingMessage) => {
                  const { nanoid } = require('nanoid');
                  return (req.headers?.['x-request-id'] as string) || nanoid();
                },
              },
            };
          },
        }),
      ],
      exports: [LoggerModule],
    };
  }
}
