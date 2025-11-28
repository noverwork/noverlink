import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github2';

import { AppConfigService } from '../../app-config';
import { OAuthProfile } from './google.strategy';

type VerifyCallback = (
  err: Error | null,
  user?: OAuthProfile,
  info?: unknown
) => void;

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(appConfigService: AppConfigService) {
    const { github } = appConfigService.oauth;
    super({
      clientID: github.clientId || '',
      clientSecret: github.clientSecret || '',
      callbackURL: github.callbackUrl || '',
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ): Promise<void> {
    const { id, emails, displayName, username } = profile;

    const oauthProfile: OAuthProfile = {
      id,
      email: emails?.[0]?.value || '',
      name: displayName || username || '',
    };

    done(null, oauthProfile);
  }
}
