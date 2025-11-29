export enum EnvField {
  NodeEnv = 'NODE_ENV',
  LogLevel = 'LOG_LEVEL',
  AppBind = 'APP_BIND',
  AppPort = 'APP_PORT',
  DBClientUrl = 'DB_CLIENT_URL',
  DBDebug = 'DB_DEBUG',
  // JWT
  JwtSecret = 'JWT_SECRET',
  JwtExpiresIn = 'JWT_EXPIRES_IN',
  JwtRefreshSecret = 'JWT_REFRESH_SECRET',
  JwtRefreshExpiresIn = 'JWT_REFRESH_EXPIRES_IN',
  // OAuth - Google
  GoogleClientId = 'GOOGLE_CLIENT_ID',
  GoogleClientSecret = 'GOOGLE_CLIENT_SECRET',
  GoogleCallbackUrl = 'GOOGLE_CALLBACK_URL',
  // OAuth - GitHub
  GithubClientId = 'GITHUB_CLIENT_ID',
  GithubClientSecret = 'GITHUB_CLIENT_SECRET',
  GithubCallbackUrl = 'GITHUB_CALLBACK_URL',
  // Frontend URL for OAuth redirects
  FrontendUrl = 'FRONTEND_URL',
  // Tunnel/Relay
  TicketSecret = 'TICKET_SECRET',
  RelayUrl = 'RELAY_URL',
  RelaySecret = 'RELAY_SECRET',
}
