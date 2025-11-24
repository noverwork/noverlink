import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@noverlink/shared';

import { EnvField } from './env.constant';

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get env() {
    return {
      nodeEnv: this.configService.getOrThrow<Environment>(EnvField.NodeEnv),
      logLevel: this.configService.get<string>(EnvField.LogLevel, 'info'),
      isProduction:
        this.configService.getOrThrow<Environment>(EnvField.NodeEnv) ===
        Environment.Production,
    };
  }

  get app() {
    return {
      bind: this.configService.getOrThrow<string>(EnvField.AppBind),
      port: this.configService.getOrThrow<number>(EnvField.AppPort),
    };
  }

  get db() {
    return {
      clientUrl: this.configService.getOrThrow<string>(EnvField.DBClientUrl),
      debug: this.configService.getOrThrow<boolean>(EnvField.DBDebug),
    };
  }
}
