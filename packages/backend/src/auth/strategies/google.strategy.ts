import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';

import { AppConfigService } from '../../app-config';

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  accessToken: string;
  refreshToken?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(appConfigService: AppConfigService) {
    const { google } = appConfigService.oauth;
    super({
      clientID: google.clientId || '',
      clientSecret: google.clientSecret || '',
      callbackURL: google.callbackUrl || '',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    const { id, emails, displayName } = profile;

    const oauthProfile: OAuthProfile = {
      id,
      email: emails?.[0]?.value || '',
      name: displayName || '',
      accessToken,
      refreshToken,
    };

    done(null, oauthProfile);
  }
}
