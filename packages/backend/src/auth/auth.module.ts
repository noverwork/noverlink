import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AppConfigModule, AppConfigService } from '../app-config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { GithubStrategy, GoogleStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [
    AppConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwt.secret,
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    JwtAuthGuard,
  ],
  exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
