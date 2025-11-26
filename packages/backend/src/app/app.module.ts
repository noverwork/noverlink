import { MikroOrmModule } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Module } from '@nestjs/common';
import { ENTITIES } from '@noverlink/backend-shared';
import { PinoLoggerModule } from '@noverlink/backend-shared';
import { PinoLogger } from 'nestjs-pino';

import { AppConfigService } from '../app-config';
import { AppConfigModule } from '../app-config/app-config.module';
import { SERVICE_NAME } from './app.constant';
import { AppController } from './app.controller';
import { AppService } from './app.service';

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
          ensureDatabase: false,
        };
      },
      inject: [AppConfigService, PinoLogger],
      driver: PostgreSqlDriver,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
