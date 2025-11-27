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
      logLevel: this.configService.getOrThrow<string>(EnvField.LogLevel),
      isProduction:
        this.configService.getOrThrow<Environment>(EnvField.NodeEnv) ===
        Environment.Production,
    };
  }

  get app() {
    return {
      bind: this.configService.getOrThrow<string>(EnvField.AppBind),
      port: this.configService.getOrThrow<number>(EnvField.AppPort),
      frontendUrl: this.configService.getOrThrow<string>(EnvField.FrontendUrl),
    };
  }

  get db() {
    return {
      clientUrl: this.configService.getOrThrow<string>(EnvField.DBClientUrl),
      debug: this.configService.getOrThrow<boolean>(EnvField.DBDebug),
    };
  }

  get jwt() {
    return {
      secret: this.configService.getOrThrow<string>(EnvField.JwtSecret),
      expiresIn: this.configService.getOrThrow<string>(EnvField.JwtExpiresIn),
      refreshSecret: this.configService.getOrThrow<string>(
        EnvField.JwtRefreshSecret
      ),
      refreshExpiresIn: this.configService.getOrThrow<string>(
        EnvField.JwtRefreshExpiresIn
      ),
    };
  }

  get oauth() {
    return {
      google: {
        clientId: this.configService.getOrThrow<string>(
          EnvField.GoogleClientId
        ),
        clientSecret: this.configService.getOrThrow<string>(
          EnvField.GoogleClientSecret
        ),
        callbackUrl: this.configService.getOrThrow<string>(
          EnvField.GoogleCallbackUrl
        ),
      },
      github: {
        clientId: this.configService.getOrThrow<string>(
          EnvField.GithubClientId
        ),
        clientSecret: this.configService.getOrThrow<string>(
          EnvField.GithubClientSecret
        ),
        callbackUrl: this.configService.getOrThrow<string>(
          EnvField.GithubCallbackUrl
        ),
      },
    };
  }
}
