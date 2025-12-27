import type { Loaded } from '@mikro-orm/core';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OAuthProvider, type User } from '@noverlink/backend-shared';
import type { Request, Response } from 'express';

import { AppConfigService } from '../app-config';
import { type AuthResponse, AuthService } from './auth.service';
import { CurrentUser, Public } from './decorators';
import {
  type DeviceCodeResponse,
  DevicePollDto,
  type DevicePollResponse,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto';
import { CliAuthGuard } from './guards/cli-auth.guard';
import type { OAuthProfile } from './strategies/google.strategy';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfigService: AppConfigService
  ) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(dto);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(): void {
    // Guard redirects to Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const profile = req.user as OAuthProfile;
    const authResponse = await this.authService.validateOAuthLogin(
      OAuthProvider.GOOGLE,
      profile
    );

    this.redirectWithTokens(res, authResponse);
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth(): void {
    // Guard redirects to GitHub
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(
    @Req() req: Request,
    @Res() res: Response
  ): Promise<void> {
    const profile = req.user as OAuthProfile;
    const authResponse = await this.authService.validateOAuthLogin(
      OAuthProvider.GITHUB,
      profile
    );

    this.redirectWithTokens(res, authResponse);
  }

  // ==================== Device Code Flow (CLI Authentication) ====================

  @Public()
  @Post('device')
  startDeviceFlow(): DeviceCodeResponse {
    return this.authService.startDeviceFlow();
  }

  @Public()
  @Post('device/poll')
  pollDeviceFlow(@Body() dto: DevicePollDto): Promise<DevicePollResponse> {
    return this.authService.pollDeviceFlow(dto.device_code);
  }

  @Post('device/approve')
  async approveDeviceCode(
    @Body('user_code') userCode: string,
    @CurrentUser() user: Loaded<User, never>
  ): Promise<{ success: boolean }> {
    const success = await this.authService.approveDeviceCode(userCode, user.id);
    return { success };
  }

  @Post('device/deny')
  denyDeviceCode(@Body('user_code') userCode: string): { success: boolean } {
    const success = this.authService.denyDeviceCode(userCode);
    return { success };
  }

  // ==================== User Profile ====================

  @Get('me')
  getProfile(@CurrentUser() user: Loaded<User, 'plan'>) {
    const plan = user.plan.$;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      plan: plan.id,
      maxTunnels: plan.maxTunnels,
      maxBandwidthMb: plan.maxBandwidthMb,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  @Patch('me')
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: Loaded<User, 'plan'>
  ) {
    return this.authService.updateProfile(user.id, dto);
  }

  // ==================== CLI Profile ====================

  @Public()
  @UseGuards(CliAuthGuard)
  @Get('cli/me')
  getCliProfile(@CurrentUser() user: Loaded<User, 'plan'>) {
    const plan = user.plan.$;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: plan.id,
    };
  }

  private redirectWithTokens(res: Response, authResponse: AuthResponse): void {
    const frontendUrl = this.appConfigService.app.frontendUrl;
    const params = new URLSearchParams({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      expiresIn: authResponse.expiresIn.toString(),
    });

    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
