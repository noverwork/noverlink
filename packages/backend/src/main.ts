import { Logger, ValidationPipe } from '@nestjs/common';
import { NestApplication, NestFactory } from '@nestjs/core';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { AppConfigService } from './app-config';

async function bootstrap() {
  const app = await NestFactory.create<NestApplication>(AppModule, {
    bufferLogs: true,
    rawBody: true, // Required for Polar webhook signature verification
  });

  const appConfigService = app.get(AppConfigService);
  const {
    app: { port, bind: host },
    env: { isProduction },
  } = appConfigService;

  // Use Pino logger
  app.useLogger(app.get(PinoLogger));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: isProduction,
      enableDebugMessages: !isProduction,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      forbidUnknownValues: true,
    })
  );

  // CORS configuration
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Location'],
    credentials: true,
  });


  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Handle shutdown signals for graceful cleanup
  const shutdown = async (signal: string) => {
    Logger.log(`${signal} received, shutting down gracefully...`);
    try {
      await app.close();
      Logger.log('✅ Application shutdown complete');
      process.exit(0);
    } catch (error) {
      Logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  await app.listen(port, host);

  Logger.log(`🚀 Noverlink Backend running on: http://${host}:${port}`);
  Logger.log(`📝 Environment: ${isProduction ? 'production' : 'development'}`);
}

void bootstrap();
