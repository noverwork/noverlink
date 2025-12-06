import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ENTITIES } from '@noverlink/backend-shared';
import { PinoLoggerModule } from '@noverlink/backend-shared';
import { PinoLogger } from 'nestjs-pino';

import { AppConfigService } from '../app-config';
import { AppConfigModule } from '../app-config/app-config.module';
import { AuthModule, JwtAuthGuard } from '../auth';
import { BillingModule } from '../billing';
import { RelayModule } from '../relay';
import { TunnelsModule } from '../tunnels';
import { SERVICE_NAME } from './app.constant';
import { AppController } from './app.controller';

@Module({
  imports: [
    AppConfigModule,
    PinoLoggerModule.forRootAsync({
      inject: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => ({
        isProduction: appConfigService.env.isProduction,
        nodeEnv: appConfigService.env.nodeEnv,
        serviceName: SERVICE_NAME,
      }),
    }),
    MikroOrmModule.forRootAsync({
      useFactory: (appConfigService: AppConfigService, logger: PinoLogger) => {
        const {
          env: { isProduction },
          db: { clientUrl, debug },
        } = appConfigService;
        return {
          driver: PostgreSqlDriver,
          clientUrl,
          entities: ENTITIES,
          logger: (message: string) => logger.debug(message),
          debug: debug && !isProduction,
        };
      },
      inject: [AppConfigService, PinoLogger],
      driver: PostgreSqlDriver,
    }),
    AuthModule,
    BillingModule,
    TunnelsModule,
    RelayModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
