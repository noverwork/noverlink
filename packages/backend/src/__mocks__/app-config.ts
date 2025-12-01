// Mock for app-config module to avoid environment validation in tests
export class AppConfigService {
  get env() {
    return {
      nodeEnv: 'development',
      logLevel: 'debug',
      isProduction: false,
    };
  }

  get app() {
    return {
      bind: '127.0.0.1',
      port: 3000,
      frontendUrl: 'http://localhost:4200',
    };
  }

  get db() {
    return {
      clientUrl: 'postgres://test:test@localhost:5432/test',
      debug: false,
    };
  }

  get jwt() {
    return {
      secret: 'test-jwt-secret-key-for-testing-purposes-12345678',
      expiresIn: '15m',
      refreshSecret: 'test-refresh-secret-key-for-testing-purposes-12345678',
      refreshExpiresIn: '7d',
    };
  }

  get oauth() {
    return {
      google: {
        clientId: 'test-google-client-id',
        clientSecret: 'test-google-client-secret',
        callbackUrl: 'http://localhost:3000/auth/google/callback',
      },
      github: {
        clientId: 'test-github-client-id',
        clientSecret: 'test-github-client-secret',
        callbackUrl: 'http://localhost:3000/auth/github/callback',
      },
    };
  }

  get tunnel() {
    return {
      ticketSecret: 'test-ticket-secret-key-for-testing-purposes-12345678',
      relayUrl: 'wss://localhost:8443',
    };
  }

  get relay() {
    return {
      secret: 'test-relay-secret-key-for-testing-purposes-12345678',
    };
  }
}

export class AppConfigModule {}
